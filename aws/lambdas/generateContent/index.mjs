import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// System prompts per platform
const SYSTEM_PROMPTS = {
  twitter: `You are an expert social media strategist specializing in Twitter/X threads.
Create engaging Twitter threads that:
- Start with a powerful hook in the first tweet
- Use numbered tweets (1/, 2/, etc.)
- Include relevant emojis sparingly
- End with a call-to-action
- Stay within 280 characters per tweet
- Aim for 5-8 tweets in a thread
Adapt your tone based on the tone value (0=very corporate/formal, 100=very casual/viral).`,

  linkedin: `You are a professional content writer specializing in LinkedIn posts.
Create LinkedIn posts that:
- Open with a compelling personal insight or hook
- Use short paragraphs and line breaks for readability
- Include actionable takeaways
- End with a question to drive engagement
- Use professional but accessible language
- Include 3-5 relevant hashtags at the end
Adapt your tone based on the tone value (0=very corporate/formal, 100=very casual/conversational).`,

  instagram: `You are a social media expert specializing in Instagram captions.
Create Instagram captions that:
- Start with an attention-grabbing first line
- Tell a micro-story or share a relatable insight
- Include a clear call-to-action
- Add 20-30 relevant hashtags at the end (separated by a line break)
- Use emojis naturally
- Keep the main caption under 300 words
Adapt your tone based on the tone value (0=very polished/brand-like, 100=very casual/authentic).`,

  blog: `You are a professional content writer and SEO expert.
Create comprehensive blog articles that:
- Include a compelling title with an H1 heading
- Have clear section headers (H2, H3)
- Include an engaging introduction
- Provide actionable, well-researched content
- Use bullet points and numbered lists where appropriate
- End with a conclusion and call-to-action
- Are formatted in clean Markdown
Adapt your tone based on the tone value (0=very formal/academic, 100=very casual/conversational).`,
};

const LENGTH_GUIDANCE = {
  short: "Keep the output concise — around 150-300 words.",
  medium: "Aim for a medium-length output — around 300-600 words.",
  long: "Create a comprehensive, detailed output — 600-1200 words.",
};

function buildPrompt(seedText, platform, tone, length) {
  const systemPrompt = SYSTEM_PROMPTS[platform] || SYSTEM_PROMPTS.twitter;
  const lengthGuide = LENGTH_GUIDANCE[length] || LENGTH_GUIDANCE.medium;

  return {
    system: systemPrompt,
    user: `Tone value: ${tone}/100. ${lengthGuide}

Here is the seed content to transform:

---
${seedText.slice(0, 8000)}
---

Generate the ${platform} content now. Output ONLY the content, no explanations or meta-commentary.`,
  };
}

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { seedText, platform, tone = 50, length = "medium" } = body;

    if (!seedText || !platform) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "seedText and platform are required" }),
      };
    }

    const prompt = buildPrompt(seedText, platform, tone, length);

    // Call Claude 3.5 Sonnet via Bedrock
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4096,
        system: prompt.system,
        messages: [{ role: "user", content: prompt.user }],
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    const response = await bedrock.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const generatedText = result.content[0].text;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        generatedText,
        model: "claude-3.5-sonnet",
        platform,
        usage: result.usage,
      }),
    };
  } catch (err) {
    console.error("Generation error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
