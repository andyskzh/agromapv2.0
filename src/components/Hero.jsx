import { useRouter } from "next/router";

export default function Hero() {
  const router = useRouter();

  return (
    <section
      className="relative w-full h-[440px] bg-cover bg-center flex items-center"
      style={{ backgroundImage: "url('/hero.jpg')" }}
    >
      {/* Capa oscura encima de la imagen */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Contenido centrado con márgenes laterales */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-white">
        <h1 className="text-5xl font-bold mb-6">AgroMap</h1>
        <p className="text-lg leading-relaxed mb-6 max-w-2xl">
          En AgroMap conectamos a los consumidores con los productos agrícolas
          más frescos y saludables. Descubra la disponibilidad de alimentos en
          mercados cercanos, explore sus beneficios nutricionales y planifique
          su compra desde la comodidad de su hogar.
        </p>
        <button
          onClick={() => router.push("/sobre-nosotros")}
          className="bg-white text-green-600 font-semibold px-5 py-2 rounded hover:bg-green-100 transition"
        >
          Sobre Nosotros
        </button>
      </div>
    </section>
  );
}
