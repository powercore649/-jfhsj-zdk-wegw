// scripts/make-admin.ts — Passe un compte en administrateur (approbation des bots, etc.)
//
// Utilisation :
//   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/make-admin.ts <discordId>
//
// Comment trouver ton Discord ID : Discord > Paramètres > Avancés > Mode développeur (activer),
// puis clic droit sur ton propre profil > "Copier l'identifiant".
//
// Ton compte doit déjà exister en base (connecte-toi au moins une fois sur le site via Discord
// avant de lancer ce script, sinon il n'y a pas encore de ligne User à mettre à jour).

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const discordId = process.argv[2];
  if (!discordId) {
    console.error("Usage: ts-node scripts/make-admin.ts <discordId>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { discordId } });
  if (!user) {
    console.error(`Aucun utilisateur avec l'ID Discord ${discordId}. Connecte-toi au moins une fois sur le site d'abord.`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { discordId },
    data: { isAdmin: true },
  });

  console.log(`✅ ${updated.username} (${updated.discordId}) est maintenant administrateur.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
