import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function DashboardRouter() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const role = session.user.role;

    if (role === "ADMIN") router.push("/dashboard/admin/statistics");
    else if (role === "MARKET_MANAGER") router.push("/dashboard/manager");
    else router.push("/dashboard/user");
  }, [session, status, router]);

  return <p className="p-4">Cargando dashboard...</p>;
}
