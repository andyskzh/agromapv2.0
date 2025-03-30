import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function PaginaProtegida() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") return <p>Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Página protegida</h1>
      <p>Bienvenido, {session.user.name}.</p>
      <p>
        Tu rol es: <strong>{session.user.role}</strong>
      </p>
    </div>
  );
}
