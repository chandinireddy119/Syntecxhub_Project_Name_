// ============================================================
// User Management System - Single File (server.js)
// Node.js + Express.js + MongoDB + Mongoose
// Secured with Basic Authentication
// ============================================================

// ---------------------- IMPORTS ----------------------------
const express = require("express");
const mongoose = require("mongoose");
const basicAuth = require("basic-auth");

// ---------------------- APP SETUP ---------------------------
const app = express();
const PORT = 5000;

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// ---------------------- DATABASE CONNECTION -------------------
// Connect to local MongoDB instance
mongoose
  .connect("mongodb://127.0.0.1:27017/user_management")
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ---------------------- MONGOOSE SCHEMA & MODEL ----------------
// Define the structure of a User document
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
});

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

// ---------------------- BASIC AUTH MIDDLEWARE -------------------
// This middleware protects every route below it.
// It checks for a valid Basic Auth username/password.
const authMiddleware = (req, res, next) => {
  const credentials = basicAuth(req);

  const VALID_USERNAME = "admin";
  const VALID_PASSWORD = "12345";

  // If no credentials were sent, or they don't match -> 401 Unauthorized
  if (
    !credentials ||
    credentials.name !== VALID_USERNAME ||
    credentials.pass !== VALID_PASSWORD
  ) {
    res.set("WWW-Authenticate", 'Basic realm="User Management API"');
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or missing credentials",
    });
  }

  // Credentials are valid, proceed to the next handler
  next();
};

// ---------------------- ROOT ROUTE (NO AUTH NEEDED) ---------------
// Simple health-check route to confirm the server is running
app.get("/", (req, res) => {
  res.status(200).send("User Management API Running");
});

// ---------------------- APPLY AUTH TO ALL /users ROUTES -----------
// Every route starting with /users will require Basic Auth
app.use("/users", authMiddleware);

// ============================================================
// CRUD ROUTES FOR USERS
// ============================================================

// ---------------------- CREATE USER (POST /users) -----------------
app.post("/users", async (req, res) => {
  try {
    const { name, email, age } = req.body;

    // Basic validation of required fields
    if (!name || !email || !age) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and age are all required fields",
      });
    }

    // Create and save the new user document
    const newUser = new User({ name, email, age });
    const savedUser = await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: savedUser,
    });
  } catch (error) {
    // Handle duplicate email error (unique constraint violation)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// ---------------------- GET ALL USERS (GET /users) -----------------
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// ---------------------- GET SINGLE USER (GET /users/:id) ------------
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    // If no user found with that ID
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    // Handles invalid ObjectId format as well
    return res.status(400).json({
      success: false,
      message: "Invalid User ID",
      error: error.message,
    });
  }
});

// ---------------------- UPDATE USER (PUT /users/:id) -----------------
app.put("/users/:id", async (req, res) => {
  try {
    const { name, email, age } = req.body;

    // Update the user and return the new (updated) document
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, age },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid request",
      error: error.message,
    });
  }
});

// ---------------------- DELETE USER (DELETE /users/:id) --------------
app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid User ID",
      error: error.message,
    });
  }
});

// ---------------------- 404 HANDLER FOR UNKNOWN ROUTES -----------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ---------------------- START SERVER ------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});