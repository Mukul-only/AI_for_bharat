import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// Try Claude Haiku first, fall back to Amazon Nova Lite, then Titan
const MODELS_TO_TRY = [
  "us.anthropic.claude-3-haiku-20240307-v1:0",
  "us.amazon.nova-lite-v1:0",
  "amazon.titan-text-express-v1",
];

async function callModel(messages, maxTokens = 1024, temperature = 0.3) {
  for (const modelId of MODELS_TO_TRY) {
    try {
      const command = new ConverseCommand({
        modelId,
        messages,
        inferenceConfig: { maxTokens, temperature },
      });
      const response = await bedrock.send(command);
      return {
        text: response.output.message.content[0].text,
        model: modelId,
      };
    } catch (err) {
      console.warn(`Model ${modelId} failed: ${err.message}`);
    }
  }
  throw new Error("All models failed. Check Bedrock model access.");
}

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { text, platform = "twitter" } = body;

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "text is required" }),
      };
    }

    const systemPrompt = `You are a social media analytics expert. Analyze the given content for its viral potential and engagement probability on ${platform}.

You MUST respond with ONLY a valid JSON object in this exact format, no other text:
{
  "score": <number 0-100>,
  "sentiment": {
    "positive": <number 0-100>,
    "negative": <number 0-100>,
    "neutral": <number 0-100>
  },
  "suggestions": [
    "<string: actionable suggestion 1>",
    "<string: actionable suggestion 2>",
    "<string: actionable suggestion 3>",
    "<string: actionable suggestion 4>",
    "<string: actionable suggestion 5>"
  ]
}

Score criteria:
- 0-20: Poor engagement potential
- 21-40: Below average
- 41-60: Average
- 61-80: Good viral potential
- 81-100: Excellent viral potential

Consider: hook strength, emotional resonance, readability, call-to-action clarity, hashtag strategy, platform best practices.`;

    const result = await callModel(
      [
        {
          role: "user",
          content: [
            {
              text: `${systemPrompt}\n\nAnalyze this ${platform} content for viral potential:\n\n${text.slice(0, 4000)}`,
            },
          ],
        },
      ],
      1024,
      0.3,
    );

    let analysis;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : result.text);
    } catch (parseErr) {
      analysis = {
        score: 50,
        sentiment: { positive: 40, negative: 20, neutral: 40 },
        suggestions: [
          "Unable to fully parse analysis — try regenerating",
          "Ensure content has a strong opening hook",
          "Add a clear call-to-action",
          "Consider using more platform-specific formatting",
          "Test different content lengths for engagement",
        ],
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...analysis,
        model: result.model,
        platform,
      }),
    };
  } catch (err) {
    console.error("Scoring error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
