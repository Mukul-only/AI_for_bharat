import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE = process.env.USER_DATA_TABLE || "NexusFlowUserData";

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const method = event.httpMethod;
  const userId = event.pathParameters?.userId;

  if (!userId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "userId is required" }),
    };
  }

  try {
    // ── GET: Load user data ──
    if (method === "GET") {
      const result = await docClient.send(
        new GetCommand({
          TableName: TABLE,
          Key: { userId },
        }),
      );

      if (!result.Item) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            userId,
            profile: null,
            workflows: {},
            savedAt: null,
          }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          userId: result.Item.userId,
          profile: result.Item.profile || null,
          workflows: result.Item.workflows || {},
          savedAt: result.Item.savedAt,
        }),
      };
    }

    // ── PUT: Save user data ──
    if (method === "PUT") {
      const body = JSON.parse(event.body || "{}");
      const { profile, workflows } = body;

      // Get existing data to merge
      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE,
          Key: { userId },
        }),
      );

      const item = {
        userId,
        profile:
          profile !== undefined ? profile : existing.Item?.profile || null,
        workflows:
          workflows !== undefined ? workflows : existing.Item?.workflows || {},
        savedAt: new Date().toISOString(),
        updatedAt: Date.now(),
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE,
          Item: item,
        }),
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, userId, savedAt: item.savedAt }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (err) {
    console.error("User data error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
