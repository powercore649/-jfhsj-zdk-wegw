import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.upsert({
    where: { discordId: "000000000000000000" },
    update: {},
    create: {
      discordId: "000000000000000000",
      username: "relay-team",
      isAdmin: true,
    },
  });

  await prisma.bot.upsert({
    where: { discordId: "111111111111111111" },
    update: {},
    create: {
      discordId: "111111111111111111",
      name: "Sentinel",
      shortDesc: "Modération automatique, anti-raid et journaux d'audit en un clic.",
      longDesc:
        "Sentinel surveille ton serveur en continu : filtrage de messages, anti-raid, avertissements automatiques et journaux détaillés. Configurable entièrement via des commandes slash, sans tableau de bord externe nécessaire.",
      prefix: "/",
      tags: ["Modération", "Utilitaire"],
      status: "APPROVED",
      featured: true,
      serverCount: 48213,
      ownerId: owner.id,
    },
  });

  await prisma.bot.upsert({
    where: { discordId: "222222222222222222" },
    update: {},
    create: {
      discordId: "222222222222222222",
      name: "Wavelength",
      shortDesc: "Musique haute qualité depuis YouTube, Spotify et SoundCloud.",
      longDesc: "Wavelength diffuse de la musique sans coupure, avec files d'attente partagées et filtres audio.",
      prefix: "!",
      tags: ["Musique", "Fun"],
      status: "APPROVED",
      serverCount: 132044,
      ownerId: owner.id,
    },
  });

  await prisma.bot.upsert({
    where: { discordId: "333333333333333333" },
    update: {},
    create: {
      discordId: "333333333333333333",
      name: "Ledger",
      shortDesc: "Économie virtuelle, boutique et classements pour ton serveur.",
      longDesc: "Ledger ajoute une monnaie virtuelle, des mini-jeux et une boutique personnalisable à ton serveur.",
      prefix: "$",
      tags: ["Économie", "Jeux"],
      status: "APPROVED",
      serverCount: 9120,
      ownerId: owner.id,
    },
  });

  await prisma.server.upsert({
    where: { discordId: "444444444444444444" },
    update: {},
    create: {
      discordId: "444444444444444444",
      name: "Relay Community",
      shortDesc: "La communauté officielle Relay : entraide, annonces et discussions bots/serveurs.",
      longDesc:
        "Rejoins la communauté Relay pour discuter des bots et serveurs référencés, proposer des idées et échanger avec l'équipe.",
      inviteUrl: "https://discord.gg/relay-demo",
      tags: ["Communauté", "Tech"],
      status: "APPROVED",
      featured: true,
      memberCount: 5230,
      ownerId: owner.id,
    },
  });

  await prisma.server.upsert({
    where: { discordId: "555555555555555555" },
    update: {},
    create: {
      discordId: "555555555555555555",
      name: "Arcade Nights",
      shortDesc: "Communauté gaming multi-jeux avec tournois hebdomadaires.",
      longDesc: "Arcade Nights rassemble des joueurs de tous horizons pour des soirées jeux, tournois et discussions.",
      inviteUrl: "https://discord.gg/arcade-demo",
      tags: ["Gaming", "Fun"],
      status: "APPROVED",
      memberCount: 18420,
      ownerId: owner.id,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
