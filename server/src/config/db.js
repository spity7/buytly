import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  await mongoose.connect(env.MONGODB_URI);
  console.log("MongoDB connected");
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log("MongoDB disconnected");
};

export const isDBConnected = () => mongoose.connection.readyState === 1;
