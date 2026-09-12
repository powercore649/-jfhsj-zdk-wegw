import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const bot = await prisma.bot.findUnique({
    where: { id: params.id },
    include: { _count: { select: { votes: true } }, owner: { select: { username: true, avatar: true } } },
  });
  if (!bot) return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  return NextResponse.json(bot);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const bot = await prisma.bot.findUnique({ where: { id: params.id } });
  if (!bot) return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  if (bot.ownerId !== (session as any).userId && !(session as any).isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const allowed = [
    "shortDesc",
    "longDesc",
    "prefix",
    "website",
    "supportUrl",
    "githubUrl",
    "tags",
  ];
  const data: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) data[key] = body[key];

  // Admin-only fields
  if ((session as any).isAdmin) {
    if ("status" in body) data.status = body.status;
    if ("featured" in body) data.featured = body.featured;
  }

  const updated = await prisma.bot.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const bot = await prisma.bot.findUnique({ where: { id: params.id } });
  if (!bot) return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  if (bot.ownerId !== (session as any).userId && !(session as any).isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.bot.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
