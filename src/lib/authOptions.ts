import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import GoogleProvider from "next-auth/providers/google";
import NextAuth, { NextAuthOptions } from "next-auth";

async function refreshAccessToken(refreshToken: string) {
  try {

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const tokens = await response.json();

    if (!response.ok) {
      console.error("❌ Failed to refresh token:", tokens);
      throw tokens;
    }

    const expiresAt = Date.now() + tokens.expires_in * 1000;


    return {
      accessToken: tokens.access_token,
      expiresAt,
    };
  } catch (error) {
    console.error("🚨 Error refreshing access token:", error);
    return null;
  }
}
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.google.com/o/oauth2/auth",
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive",
          access_type: "offline",
          prompt: "consent",
          redirect_uri: `${process.env.AUTH_URL}/api/auth/callback/google`
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at * 1000;
      }

      const tenMinutes = 10 * 60 * 1000;
      if (Date.now() > token.expiresAt - tenMinutes) {
        const newTokens = await refreshAccessToken(token.refreshToken);
        if (newTokens) {
          token.accessToken = newTokens.accessToken;
          token.expiresAt = newTokens.expiresAt;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.accessToken = token.accessToken;
      session.user.expiresAt = token.expiresAt;

      return session;
    },

    async signIn({ user, account }) {
      if (account.provider === "google") {
        const { name, email } = user;
        try {
          await connectMongoDB();
          let userExists = await User.findOne({ email });

          if (!userExists) {
            userExists = await User.create({
              name,
              email,
              refreshToken: account?.refresh_token,
              accessToken: account?.access_token,
              expiresAt: account?.expires_at * 1000,
            });
          } else {
            userExists.refreshToken = account?.refresh_token;
            userExists.accessToken = account?.access_token;
            userExists.expiresAt = account?.expires_at * 1000;
            await userExists.save();
          }

          return true;
        } catch (error) {
          console.log("Error in signIn:", error);
          return false;
        }
      }
      return true;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
