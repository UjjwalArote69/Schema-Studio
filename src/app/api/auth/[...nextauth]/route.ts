import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"; // <-- New import
import { PrismaAdapter } from "@auth/prisma-adapter";
import {prisma} from "@/lib/prisma";
import bcrypt from "bcryptjs"; // <-- New import

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // 1. MUST set strategy to "jwt" when using Credentials with Prisma
  session: {
    strategy: "jwt", 
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    // 2. Add the Credentials Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Find user in MySQL
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // If no user, or if they signed up with Google/GitHub and have no password
        if (!user || !user?.password) {
          throw new Error("Invalid credentials");
        }

        // Check if password matches the hash
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        // Return the user object if successful
        return user;
      }
    })
  ],
  callbacks: {
    // 3. Update callbacks to handle JWT mapping
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Map DB ID to the token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // Map token ID to the frontend session
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };