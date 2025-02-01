import mongoose from "mongoose";

export const connectMongoDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("Missing mongo db uri");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MONGODB");
  } catch (error) {
    console.log("Erro connecting to database: ", error);
  }
};
