import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireOwnedGuild(discordId: string, userId: string) {
  const guild = await prisma.managedGuild.findUnique({ where: { discordId } });
  if (!guild || guild.ownerId !== userId) return null;
  return guild;
}

export async function GET(_req: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const guild = await requireOwnedGuild(params.guildId, (session as any).userId);
  if (!guild) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(guild);
}

const updateSchema = z.object({
  prefix: z.string().min(1).max(5).optional(),
  welcomeChannelId: z.string().nullable().optional(),
  welcomeMessage: z.string().max(500).nullable().optional(),
  autoRoleId: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const guild = await requireOwnedGuild(params.guildId, (session as any).userId);
  if (!guild) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.managedGuild.update({
    where: { discordId: params.guildId },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}
