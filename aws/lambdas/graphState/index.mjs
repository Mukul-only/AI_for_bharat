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
const TABLE = process.env.GRAPH_TABLE || "NexusFlowGraphs";

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const method = event.httpMethod;
  const workspaceId = event.pathParameters?.workspaceId;

  if (!workspaceId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "workspaceId is required" }),
    };
  }

  try {
    // ── GET: Load workspace ──
    if (method === "GET") {
      const result = await docClient.send(
        new GetCommand({
          TableName: TABLE,
          Key: { workspaceId },
        }),
      );

      if (!result.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Workspace not found" }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          nodes: result.Item.nodes,
          edges: result.Item.edges,
          metadata: result.Item.metadata,
          savedAt: result.Item.savedAt,
        }),
      };
    }

    // ── PUT: Save workspace ──
    if (method === "PUT") {
      const body = JSON.parse(event.body || "{}");
      const { nodes, edges, metadata = {} } = body;

      if (!nodes || !edges) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "nodes and edges are required" }),
        };
      }

      await docClient.send(
        new PutCommand({
          TableName: TABLE,
          Item: {
            workspaceId,
            nodes,
            edges,
            metadata,
            savedAt: new Date().toISOString(),
            ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 day TTL
          },
        }),
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, workspaceId }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (err) {
    console.error("Graph state error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
