// Small helpers around the Discord API used across the dashboard.

export const DISCORD_API = "https://discord.com/api/v10";

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

// MANAGE_GUILD permission bit
const MANAGE_GUILD = 0x20;

export function canManageGuild(permissions: string) {
  const perms = BigInt(permissions);
  return perms & BigInt(MANAGE_GUILD) ? true : false;
}

export async function fetchUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    // Discord guild membership changes often; never cache this.
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export function guildIconUrl(guildId: string, icon: string | null) {
  if (!icon) return null;
  const ext = icon.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guildId}/${icon}.${ext}?size=128`;
}

export function botAvatarUrl(discordId: string, avatar: string | null | undefined) {
  if (!avatar) {
    // Discord default avatar fallback
    return `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(discordId) % 6n)}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png?size=256`;
}

// Accepte les liens de la forme https://discord.gg/xxx ou https://discord.com/invite/xxx.
const INVITE_REGEX = /^https:\/\/(discord\.gg|discord\.com\/invite)\/[a-zA-Z0-9-]+\/?$/;

export function isValidServerInvite(url: string) {
  return INVITE_REGEX.test(url.trim());
}

export function buildInviteUrl(botClientId: string, permissions: string, guildId?: string) {
  const params = new URLSearchParams({
    client_id: botClientId,
    scope: "bot applications.commands",
    permissions,
  });
  if (guildId) params.set("guild_id", guildId);
  if (guildId) params.set("disable_guild_select", "true");
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

// --- Appels authentifiés avec le TOKEN DU BOT (serveur uniquement, jamais côté client) ---
// Ils servent à vérifier réellement la présence du bot sur un serveur avant
// de débloquer sa page de gestion, plutôt que de faire confiance à un simple clic.

async function discordBotFetch(path: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return null;
  const res = await fetch(`${DISCORD_API}${path}`, {
    headers: { Authorization: `Bot ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export type BotGuildInfo = {
  id: string;
  name: string;
  icon: string | null;
  approximate_member_count?: number;
};

// Renvoie les infos du serveur si (et seulement si) le bot y est réellement présent.
export async function fetchBotGuild(guildId: string): Promise<BotGuildInfo | null> {
  return discordBotFetch(`/guilds/${guildId}?with_counts=true`);
}

export type DiscordChannel = { id: string; name: string; type: number };
export async function fetchGuildTextChannels(guildId: string): Promise<DiscordChannel[]> {
  const channels = await discordBotFetch(`/guilds/${guildId}/channels`);
  if (!Array.isArray(channels)) return [];
  // type 0 = salon textuel
  return channels.filter((c: DiscordChannel) => c.type === 0);
}

export type DiscordRole = { id: string; name: string; managed: boolean };
export async function fetchGuildRoles(guildId: string): Promise<DiscordRole[]> {
  const roles = await discordBotFetch(`/guilds/${guildId}/roles`);
  if (!Array.isArray(roles)) return [];
  // On exclut @everyone (même id que le serveur) et les rôles gérés par une intégration
  return roles.filter((r: DiscordRole) => r.id !== guildId && !r.managed);
}
