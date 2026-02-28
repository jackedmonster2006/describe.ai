const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Configure Vercel serverless function to handle larger payloads
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { productDetails, imageBase64 } = req.body;
    
    if (!productDetails && !imageBase64) {
        return res.status(400).json({ error: 'Please provide either product text or an image screenshot.' });
    }

    try {
        const promptText = `
        You are an elite, 8-figure direct-response copywriter for premium D2C brands (like BlendJet, Ridge Wallet, Manscaped, and Gymshark).
        Your goal is to take raw, messy product details (and/or a screenshot) and turn them into a masterclass, high-converting product page.

        **CRITICAL RULES:**
        - NO cheap dropshipping words (e.g., "Buy now", "High quality", "Best seller", "Cheap", "Must have").
        - Write in a sleek, authoritative, modern brand voice. Short sentences. Punchy rhythm.
        - Focus on IDENTITY and OUTCOMES. People don't buy products, they buy better versions of themselves.
        - The formatting must be clean, scannable, and designed to minimize bounce rates.

        Please format the output EXACTLY like this:

        ### 1. Premium Brand Titles (Pick 3)
        Provide 3 short, punchy, premium-sounding titles. Use naming conventions of $100M+ brands.

        ### 2. The High-Converting Shopify Description
        **[Punchy, 3-5 Word H2 Headline]**
        (Write a 2-3 sentence emotional paragraph. Start by validating a specific frustration the user has, then introduce the product as the elegant, inevitable solution. Make it sound effortless.)

        **The Upgrade You Deserve:**
        (Provide exactly 4 bullet points using minimalist emojis like ✨, ⚡️, 🛡️, 💧. Each bullet should be formatted as **Feature:** Benefit.)

        **Engineered for Excellence:**
        (List 3 technical specs, but write them like Apple writes copy.)

        **The 30-Day Promise:**
        (Write a sleek, confident 2-sentence guarantee.)

        ### 3. Viral Social Creative (TikTok / IG Reels)
        (Write a 15-second hook-driven UGC video script. Must include:
        - [0:00] Visual hook + Verbal hook.
        - [0:05] The core problem.
        - [0:10] The product reveal + solution.
        - [0:15] The subtle Call to Action).

        Product Details provided by the user:
        "${productDetails || 'No text provided. Analyze the image.'}"
        `;

        let messageContent = [];
        messageContent.push({ type: "text", text: promptText });

        if (imageBase64) {
            messageContent.push({ type: "image_url", image_url: { url: imageBase64 } });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an elite e-commerce conversion copywriter." },
                { role: "user", content: messageContent }
            ]
        });

        res.status(200).json({ result: response.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate copy' });
    }
}
