const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

// Reuse client for connection pooling
const cosmosClient = new CosmosClient(process.env.CosmosDbConnectionString);
const cosmosContainer = cosmosClient
  .database("PressHubDB")
  .container("MediaItems");

app.http("getFeed", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      context.log("Fetching PressHub feed...");

      // 1. Scalable Query: Fetch items sorted by date
      // We use a specific SELECT to minimize data transfer (Probing only what's needed)
      const querySpec = {
        query:
          "SELECT c.id, c.title, c.caption, c.location, c.imageUrl, c.createdAt FROM c ORDER BY c.createdAt DESC",
      };

      const { resources: items } = await cosmosContainer.items
        .query(querySpec)
        .fetchAll();

      return {
        status: 200,
        jsonBody: items,
      };
    } catch (error) {
      context.error("Feed Error:", error.message);
      return { status: 500, body: "Error fetching feed." };
    }
  },
});
