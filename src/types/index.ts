export type BotWithCounts = {
  id: string;
  discordId: string;
  name: string;
  avatar: string | null;
  shortDesc: string;
  longDesc: string;
  prefix: string;
  website: string | null;
  supportUrl: string | null;
  githubUrl: string | null;
  tags: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  featured: boolean;
  serverCount: number;
  createdAt: string;
  owner?: { username: string; avatar?: string | null };
  _count?: { votes: number };
};

export type ServerWithCounts = {
  id: string;
  discordId: string;
  name: string;
  icon: string | null;
  shortDesc: string;
  longDesc: string;
  inviteUrl: string;
  tags: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  featured: boolean;
  memberCount: number;
  createdAt: string;
  owner?: { username: string; avatar?: string | null };
  _count?: { votes: number };
};
