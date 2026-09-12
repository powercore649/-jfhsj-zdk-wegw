export default function Footer() {
  return (
    <footer className="border-t border-line/70 py-10">
      <div className="container-page flex flex-col items-center justify-between gap-4 text-sm text-mist md:flex-row">
        <p>© {new Date().getFullYear()} Relay. Non affilié à Discord Inc.</p>
        <div className="flex gap-6">
          <a href="/" className="hover:text-paper">Bots</a>
          <a href="/servers" className="hover:text-paper">Serveurs</a>
          <a href="/dashboard/bots/new" className="hover:text-paper">Ajouter un bot</a>
          <a href="/dashboard/serverlist/new" className="hover:text-paper">Lister un serveur</a>
        </div>
      </div>
    </footer>
  );
}
