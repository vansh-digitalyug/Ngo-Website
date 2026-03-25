import axios from "axios";

// ─── Description prompts per context ─────────────────────────────────────────
const DESCRIPTION_PROMPTS = {
    "ngo": "You are writing for an NGO registration form. Write a compelling 2-4 sentence organization description that conveys the NGO's mission, the communities it serves, and the kind of impact it creates. Be warm, professional, and specific.",
    "event": "You are writing for an NGO event. Write a 2-3 sentence event description that captures what the event is about, who should attend, and what impact it will have. Be engaging and action-oriented.",
    "service-category": "You are writing for an NGO services page. Write a 1-2 sentence category description that clearly explains what type of programs or services fall under this category. Be concise and informative.",
    "service-program": "You are writing a short card description for an NGO program (shown on a listing page). Write 1-2 punchy sentences that explain what the program does and why it matters. Max 150 characters.",
    "service-program-full": "You are writing a full program description for an NGO services detail page. Write 3-5 sentences covering the program's goals, how it works, who it helps, and its impact. Be thorough and inspiring.",
    "gallery": "You are writing a caption/description for an NGO gallery image or media item. Write 1-2 sentences describing what the image or event depicts and its significance. Be descriptive and heartfelt.",
    "task": "You are writing a task description for an NGO volunteer task management system. Write 2-3 sentences describing what the volunteer needs to do, how to do it, and why it matters. Be clear and actionable.",
    "community": "You are writing a description for an NGO community group. Write 2-3 sentences explaining who the community is for, what they do together, and how members benefit. Be welcoming and inclusive.",
    "blog-excerpt": "You are writing a short excerpt (teaser) for an NGO blog post shown on a blog listing card. Write 1-2 compelling sentences that hook the reader and make them want to read more. Max 200 characters. Be punchy and engaging.",
};

export async function fixGrammar(req, res) {
    const { text } = req.body;
    if (!text?.trim()) {
        return res.status(400).json({ success: false, message: "Text is required" });
    }
    if (text.trim().length > 5000) {
        return res.status(400).json({ success: false, message: "Text too long (max 5000 characters)" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Fix the grammar, spelling, and punctuation of the following text. Keep the original meaning and tone. Return ONLY the corrected text — no explanation, no labels, no quotes, no markdown.\n\n${text.trim()}`;

    const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    });

    const fixed = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!fixed) return res.status(500).json({ success: false, message: "AI returned no content" });

    return res.json({ success: true, text: fixed });
}

export async function generateDescription(req, res) {
    const { context, hint } = req.body;
    if (!context || !DESCRIPTION_PROMPTS[context]) {
        return res.status(400).json({ success: false, message: "Invalid or missing context" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = DESCRIPTION_PROMPTS[context];
    const userPrompt = hint
        ? `Generate a description for: "${hint}"\n\nReturn ONLY the description text — no quotes, no labels, no markdown.`
        : `Generate a generic example description.\n\nReturn ONLY the description text — no quotes, no labels, no markdown.`;

    const response = await axios.post(url, {
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 512 },
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return res.status(500).json({ success: false, message: "AI returned no content" });

    return res.json({ success: true, description: text });
}

const VALID_CATEGORIES = [
    "Community Impact",
    "Donor Guide",
    "Volunteer Stories",
    "Education",
    "Health",
    "General",
];

const SYSTEM_PROMPT = `You are an expert blog writer for an NGO focused on social welfare in India.
Given a topic or prompt, generate a complete blog post and return ONLY valid JSON with this exact structure:
{
  "title": "Engaging blog title",
  "excerpt": "1-2 sentence hook for the blog card (max 200 characters)",
  "category": "one of: Community Impact, Donor Guide, Volunteer Stories, Education, Health, General",
  "sections": [
    { "heading": "Section heading", "body": "Section content paragraph(s)" },
    { "heading": "Section heading", "body": "Section content paragraph(s)" },
    { "heading": "Section heading", "body": "Section content paragraph(s)" }
  ]
}
Guidelines:
- Write 3-5 sections with meaningful, well-structured content
- Each section body should be 2-3 paragraphs
- Make content relevant to NGO work, social impact, volunteering, or community welfare in India
- Choose the most appropriate category from the list
- Keep the excerpt concise and compelling
- Return ONLY the JSON object — no markdown code blocks, no extra text`;

export async function generateAIContent(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await axios.post(url, {
        contents: [
            {
                parts: [{ text: `${SYSTEM_PROMPT}\n\nGenerate a blog post about: ${prompt}` }],
            },
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
        },
    });

    const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!raw) throw new Error("No content generated by AI");

    // Strip code fences if Gemini wrapped the JSON
    let jsonText = raw;
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) jsonText = fenceMatch[1];

    let parsed;
    try {
        parsed = JSON.parse(jsonText);
    } catch {
        throw new Error("AI returned content that could not be parsed as JSON");
    }

    if (!parsed.title || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
        throw new Error("AI returned an incomplete blog structure");
    }

    if (!VALID_CATEGORIES.includes(parsed.category)) {
        parsed.category = "General";
    }

    return {
        title: String(parsed.title).trim(),
        excerpt: String(parsed.excerpt || "").trim(),
        category: parsed.category,
        sections: parsed.sections
            .map((s) => ({
                heading: String(s.heading || "").trim(),
                body: String(s.body || "").trim(),
            }))
            .filter((s) => s.body),
    };
}
