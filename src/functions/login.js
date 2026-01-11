const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");
const bcrypt = require("bcryptjs");

const client = new CosmosClient(process.env.CosmosConnectionString);
const container = client.database("PressHubDB").container("Users");

app.http("login", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request) => {
    const { email, password } = await request.json();

    try {
      const { resource: user } = await container.item(email, email).read();
      if (!user) return { status: 401, body: "User not found" };

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return { status: 401, body: "Invalid password" };

      return {
        status: 200,
        body: JSON.stringify({
          name: user.name,
          role: user.role,
          email: user.email,
        }),
      };
    } catch (error) {
      return { status: 500, body: "Login error" };
    }
  },
});
