const { YoutubeTranscript } = require('youtube-transcript');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateMetadata(videoUrl) {
    try {
        console.log(`[1/3] Fetching transcript for ${videoUrl}...`);
        const transcriptRaw = await YoutubeTranscript.fetchTranscript(videoUrl);
        
        // Combine the transcript into a single readable paragraph
        const fullTranscript = transcriptRaw.map(t => t.text).join(' ');
        console.log(`[2/3] Transcript fetched successfully. Length: ${fullTranscript.length} characters.`);

        const prompt = `
        You are an expert YouTube strategist and SEO copywriter. Based on the following video transcript, generate high-performing YouTube metadata.

        **Requirements:**
        1. **Title:** Catchy, click-worthy, but not clickbait (under 70 characters). Provide 3 options.
        2. **Description:**
           - A 2-3 sentence hook at the beginning.
           - A brief summary of the video.
           - Chapters/Timestamps (guess logical sections based on context, or leave placeholders like "0:00 Intro").
           - Call to actions (Subscribe, Follow on Twitter/Insta).
           - 3-5 relevant hashtags at the bottom.
        3. **Tags:** A comma-separated list of 15-20 highly relevant SEO tags.

        **Transcript:**
        "${fullTranscript}"
        `;

        console.log(`[3/3] Generating SEO Title, Description, and Tags...`);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        console.log('\n--- RESULT ---\n');
        console.log(response.text);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Check for URL argument
const urlArg = process.argv[2];
if (urlArg) {
    generateMetadata(urlArg);
} else {
    console.log("Usage: node index.js <YOUTUBE_URL>");
}
