import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email guilds" } },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the Discord access token so we can call the Discord API
      // (used by /dashboard/servers to list the user's guilds).
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        const p = profile as any;
        token.discordId = p.id;
        token.username = p.username;
        token.avatar = p.avatar;
      }
      if (token.discordId) {
        const user = await prisma.user.upsert({
          where: { discordId: token.discordId as string },
          update: {
            username: (token.username as string) ?? "unknown",
            avatar: (token.avatar as string) ?? null,
          },
          create: {
            discordId: token.discordId as string,
            username: (token.username as string) ?? "unknown",
            avatar: (token.avatar as string) ?? null,
            email: token.email ?? null,
          },
        });
        token.userId = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).userId = token.userId;
      (session as any).discordId = token.discordId;
      (session as any).isAdmin = token.isAdmin;
      if (session.user) {
        (session.user as any).avatar = token.avatar;
        session.user.name = (token.username as string) ?? session.user.name;
      }
      return session;
    },
  },
};
