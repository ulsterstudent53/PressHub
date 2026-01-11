const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");
const bcrypt = require("bcryptjs");

const client = new CosmosClient(process.env.CosmosConnectionString);
const container = client.database("PressHubDB").container("Users");

app.http("signup", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request) => {
    const { email, name, password } = await request.json();

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await container.items.create({
        id: email, // NoSQL uses 'id' as the unique key
        email,
        name,
        password: hashedPassword,
        role: "user", // Default flag
      });
      return { status: 201, body: "User Created" };
    } catch (error) {
      return { status: 409, body: "User already exists" };
    }
  },
});
