import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard");

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-8 md:flex-row">
        <Sidebar isAdmin={!!(session as any).isAdmin} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
