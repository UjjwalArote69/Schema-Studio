/* eslint-disable @typescript-eslint/no-explicit-any */
import  { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "./email";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            accounts: {
              select: { provider: true },
              take: 1,
            },
          },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        // User exists but signed up via OAuth — no password on file
        if (!user.password) {
          const providerName = user.accounts[0]?.provider;
          if (providerName) {
            const displayName =
              providerName.charAt(0).toUpperCase() + providerName.slice(1);
            throw new Error(
              `This email is registered via ${displayName}. Please sign in with ${displayName}.`
            );
          }
          throw new Error(
            "This account uses social login. Please sign in with your original provider."
          );
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (user.email) {
        console.log("[Auth] New user created, sending welcome email to:", user.email);
        try {
          const result = await sendWelcomeEmail({
            to: user.email,
            name: user.name || "there",
          });
          if (result.success) {
            console.log("[Auth] Welcome email sent:", result.messageId);
          } else {
            console.error("[Auth] Welcome email failed:", result.error);
          }
        } catch (err) {
          console.error("[Auth] Welcome email threw:", err);
        }
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};