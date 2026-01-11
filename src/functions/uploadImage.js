const { app } = require("@azure/functions");
const { BlobServiceClient } = require("@azure/storage-blob");
const { CosmosClient } = require("@azure/cosmos");

// Initialize Clients (Connection Pooling for Scalability)
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AzureWebJobsStorage
);
const cosmosClient = new CosmosClient(process.env.CosmosDbConnectionString);
const containerClient = blobServiceClient.getContainerClient("photos");
const cosmosContainer = cosmosClient
  .database("PressHubDB")
  .container("MediaItems");

app.http("uploadImage", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      context.log("Native Form Data Upload Start...");

      // 1. Use Native Parsing (No extra libraries needed)
      const formData = await request.formData();

      const file = formData.get("file"); // This is a 'Blob' object
      const title = formData.get("title") || "Untitled";
      const caption = formData.get("caption") || "";
      const location = formData.get("location") || "Unknown";

      if (!file || typeof file === "string") {
        return {
          status: 400,
          body: "No file uploaded or incorrect field name.",
        };
      }

      // 2. Prepare Buffer for Upload
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 3. Upload to Blob Storage
      const blobName = `${Date.now()}-${file.name}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: file.type },
      });

      // 4. Save Metadata to Cosmos DB
      const mediaItem = {
        id: blobName,
        title: title,
        caption: caption,
        location: location,
        imageUrl: blockBlobClient.url,
        createdAt: new Date().toISOString(),
      };

      await cosmosContainer.items.create(mediaItem);

      return {
        status: 201,
        jsonBody: { message: "Upload successful!", item: mediaItem },
      };
    } catch (error) {
      context.error("Upload Error:", error.message);
      return { status: 500, body: `Server Error: ${error.message}` };
    }
  },
});
