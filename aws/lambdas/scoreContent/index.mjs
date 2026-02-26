import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

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

    // Use Claude 3 Haiku for fast, cost-effective scoring
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1024,
        system: `You are a social media analytics expert. Analyze the given content for its viral potential and engagement probability on ${platform}.

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

Consider: hook strength, emotional resonance, readability, call-to-action clarity, hashtag strategy, platform best practices.`,
        messages: [
          {
            role: "user",
            content: `Analyze this ${platform} content for viral potential:\n\n${text.slice(0, 4000)}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    const response = await bedrock.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const analysisText = result.content[0].text;

    // Parse the JSON response
    let analysis;
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : analysisText);
    } catch (parseErr) {
      // Fallback if JSON parsing fails
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
        model: "claude-3-haiku",
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
