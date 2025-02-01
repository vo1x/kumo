import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import GoogleProvider from "next-auth/providers/google";
import NextAuth, { NextAuthOptions } from "next-auth";

import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
