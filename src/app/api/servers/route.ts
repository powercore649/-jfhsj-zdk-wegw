import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidServerInvite } from "@/lib/discord";

// GET /api/servers?query=&tag=&sort=votes|new
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim();
  const tag = searchParams.get("tag")?.trim();
  const sort = searchParams.get("sort") ?? "votes";

  const servers = await prisma.server.findMany({
    where: {
      status: "APPROVED",
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { shortDesc: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(tag ? { tags: { has: tag } } : {}),
    },
    include: { _count: { select: { votes: true } }, owner: { select: { username: true } } },
  });

  const sorted = servers.sort((a, b) => {
    if (sort === "new") return b.createdAt.getTime() - a.createdAt.getTime();
    return b._count.votes - a._count.votes;
  });

  return NextResponse.json(sorted);
}

const createServerSchema = z.object({
  discordId: z.string().min(17).max(20),
  name: z.string().min(2).max(100),
  icon: z.string().nullable().optional(),
  shortDesc: z.string().min(10).max(150),
  longDesc: z.string().min(20).max(4000),
  inviteUrl: z.string().refine(isValidServerInvite, {
    message: "Le lien doit être une invitation Discord valide (discord.gg/... ou discord.com/invite/...).",
  }),
  tags: z.array(z.string()).max(5).default([]),
});

// POST /api/servers - submit a new server for review
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const parsed = createServerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.server.findUnique({ where: { discordId: parsed.data.discordId } });
  if (existing) {
    return NextResponse.json({ error: "Ce serveur est déjà listé." }, { status: 409 });
  }

  const server = await prisma.server.create({
    data: {
      ...parsed.data,
      ownerId: (session as any).userId,
    },
  });

  return NextResponse.json(server, { status: 201 });
}
