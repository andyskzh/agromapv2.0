import Head from "next/head";
import Image from "next/image";

export default function SobreNosotros() {
  return (
    <>
      <Head>
        <title>Sobre Nosotros - AgroMap</title>
        <meta
          name="description"
          content="Conoce más sobre AgroMap y nuestra misión de mejorar el acceso a la información de productos agropecuarios"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative h-[400px]">
          <Image
            src="/images/about/hero-about.jpg"
            alt="Agricultura en Cuba"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">AgroMap</h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto">
                Aplicación web para mejorar el acceso a la información de los
                consumidores durante la comercialización de productos
                agropecuarios.
              </p>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Sección de Texto */}
            <div className="space-y-8">
              <div className="prose prose-lg">
                <p className="text-gray-600 leading-relaxed">
                  El proyecto de colaboración internacional
                  &quot;Fortalecimiento de políticas para la seguridad
                  alimentaria sostenible en Cuba&quot; (POSAS) perteneciente al
                  Programa país SAS Cuba, e implementado por el Ministerio de la
                  Agricultura (Minag) y la Organización de Naciones Unidas para
                  la Alimentación y la Agricultura (FAO) con financiamiento de
                  la Unión Europea, está apoyando el desarrollo de la aplicación
                  Agromap, con el objetivo de responder a las demandas de
                  información de los consumidores de productos agropecuarios.
                </p>
              </div>

              <div className="prose prose-lg">
                <p className="text-gray-600 leading-relaxed">
                  Esta herramienta informática surge a partir del año 2024, como
                  parte de las acciones que se realizan para la implementación
                  de la Política de comercialización de productos agropecuarios
                  a nivel local, con énfasis en el Decreto 35 del 2021. En este
                  sentido, y coherente con la disposición del gobierno cubano de
                  cara a la transparencia e información al ciudadano, será
                  aplicada en forma de experiencia piloto en comunidades
                  pertenecientes a seis municipios de la región central de Cuba,
                  donde incide el proyecto (Santa Clara, Remedios, Placetas,
                  Sancti Spíritus, Yaguajay y Taguasco).
                </p>
              </div>
            </div>

            {/* Sección de Imágenes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-64">
                <Image
                  src="/images/about/about-1.jpg"
                  alt="Agricultura sostenible"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="relative h-64">
                <Image
                  src="/images/about/about-2.jpg"
                  alt="Mercado local"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="relative h-64">
                <Image
                  src="/images/about/about-3.jpg"
                  alt="Productos agrícolas"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="relative h-64">
                <Image
                  src="/images/about/about-4.jpg"
                  alt="Comercialización"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Sección Final */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed">
                Agromap permite su utilización en celulares y otros dispositivos
                informáticos, con la intención de hacer pública la
                disponibilidad de alimentos en la red de comercialización. La
                misma fue desarrollada por la Universidad de Ciencias
                Informáticas y la Empresa de Informática y Comunicaciones del
                MINAG (EICMA). La primera etapa de su despliegue, se realizará
                con la información de 7 Mercados Estatales (de Acopio y de las
                Empresas Agroindustriales Municipales) de estos municipios
                seleccionados.
              </p>
            </div>

            {/* Logos de Colaboradores */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              <div className="relative h-20">
                <Image
                  src="/images/about/logo-minag.png"
                  alt="Logo MINAG"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative h-20">
                <Image
                  src="/images/about/logo-fao.png"
                  alt="Logo FAO"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative h-20">
                <Image
                  src="/images/about/logo-ue.png"
                  alt="Logo Unión Europea"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative h-20">
                <Image
                  src="/images/about/logo-uci.png"
                  alt="Logo UCI"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative h-20">
                <Image
                  src="/images/about/logo-posas.png"
                  alt="Logo POSAS"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative h-20">
                <Image
                  src="/images/about/logo-eicma.png"
                  alt="Logo EICMA"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
