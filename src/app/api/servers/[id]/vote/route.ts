import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VOTE_COOLDOWN_HOURS = 12;

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const userId = (session as any).userId as string;
  const cutoff = new Date(Date.now() - VOTE_COOLDOWN_HOURS * 60 * 60 * 1000);

  const lastVote = await prisma.serverVote.findFirst({
    where: { serverId: params.id, userId, createdAt: { gt: cutoff } },
    orderBy: { createdAt: "desc" },
  });

  if (lastVote) {
    const nextAt = new Date(lastVote.createdAt.getTime() + VOTE_COOLDOWN_HOURS * 60 * 60 * 1000);
    return NextResponse.json(
      { error: "You already voted recently.", nextVoteAt: nextAt },
      { status: 429 }
    );
  }

  await prisma.serverVote.create({ data: { serverId: params.id, userId } });
  const count = await prisma.serverVote.count({ where: { serverId: params.id } });
  return NextResponse.json({ ok: true, votes: count });
}
