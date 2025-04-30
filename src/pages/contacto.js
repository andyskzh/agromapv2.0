import { useState } from "react";
import {
  FaEnvelope,
  FaStore,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
} from "react-icons/fa";

export default function ContactPage() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [marketForm, setMarketForm] = useState({
    marketName: "",
    address: "",
    legalRepresentative: "",
    phone: "",
    email: "",
    products: "",
    description: "",
  });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario de contacto
    console.log("Formulario de contacto:", contactForm);
  };

  const handleMarketSubmit = async (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario de mercado
    console.log("Formulario de mercado:", marketForm);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Contacto</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario de Contacto General */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            <FaEnvelope className="inline-block mr-2 text-green-600" />
            Contáctanos
          </h2>
          <p className="text-gray-600 mb-6">
            ¿Tienes alguna pregunta o sugerencia? Escríbenos y te responderemos
            lo antes posible.
          </p>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm({ ...contactForm, name: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 border-2 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm({ ...contactForm, email: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 border-2 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asunto
              </label>
              <input
                type="text"
                value={contactForm.subject}
                onChange={(e) =>
                  setContactForm({ ...contactForm, subject: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 border-2 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 border-2 text-gray-800"
                rows="4"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>

        {/* Formulario para Inclusión de Mercado */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            <FaStore className="inline-block mr-2 text-green-600" />
            ¿Quieres incluir tu mercado?
          </h2>
          <p className="text-gray-600 mb-6">
            Si eres gestor o dueño de un mercado y quieres que aparezca en
            nuestra plataforma, completa el siguiente formulario.
          </p>
          <form onSubmit={handleMarketSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Mercado
              </label>
              <input
                type="text"
                value={marketForm.marketName}
                onChange={(e) =>
                  setMarketForm({ ...marketForm, marketName: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 border-2 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={marketForm.address}
                onChange={(e) =>
                  setMarketForm({ ...marketForm, address: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 border-2 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Representante Legal
              </label>
              <input
                type="text"
                value={marketForm.legalRepresentative}
                onChange={(e) =>
                  setMarketForm({
                    ...marketForm,
                    legalRepresentative: e.target.value,
                  })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 border-2 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={marketForm.phone}
                onChange={(e) =>
                  setMarketForm({ ...marketForm, phone: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 border-2 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={marketForm.email}
                onChange={(e) =>
                  setMarketForm({ ...marketForm, email: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 border-2 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Productos que vende
              </label>
              <textarea
                value={marketForm.products}
                onChange={(e) =>
                  setMarketForm({ ...marketForm, products: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 border-2 text-gray-800"
                rows="2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del Mercado
              </label>
              <textarea
                value={marketForm.description}
                onChange={(e) =>
                  setMarketForm({ ...marketForm, description: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 border-2 text-gray-800"
                rows="3"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Solicitar Inclusión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
