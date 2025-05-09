import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Statistics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    users: {
      total: 0,
      byRole: { admin: 0, manager: 0, regular: 0 },
      byMonth: [],
    },
    products: {
      total: 0,
      active: 0,
      inactive: 0,
      sasProgram: 0,
      byCategory: {},
      byMonth: [],
      mostCommented: [],
      topRated: [],
    },
    markets: {
      total: 0,
      byMonth: [],
    },
    comments: {
      total: 0,
      averageRating: 0,
      ratingDistribution: {},
      byMonth: [],
    },
    baseProducts: {
      total: 0,
      byCategory: {},
    },
  });
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      setIsLoading(true);
      fetch("/api/admin/statistics")
        .then((res) => res.json())
        .then((data) => {
          setStats(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error al cargar estadísticas:", error);
          setIsLoading(false);
        });
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  // Datos para gráficos de usuarios
  const userRoleData = {
    labels: ["Administradores", "Gestores", "Usuarios"],
    datasets: [
      {
        label: "Usuarios por rol",
        data: [
          stats.users.byRole.admin,
          stats.users.byRole.manager,
          stats.users.byRole.regular,
        ],
        backgroundColor: ["#10B981", "#34D399", "#F87171"],
      },
    ],
  };

  const userGrowthData = {
    labels: stats.users.byMonth
      .map((item) => {
        const [year, month] = item.month.split("-");
        const date = new Date(year, month - 1);
        return date.toLocaleDateString("es-ES", {
          month: "short",
          year: "numeric",
        });
      })
      .reverse(),
    datasets: [
      {
        label: "Nuevos usuarios",
        data: stats.users.byMonth.map((item) => item.count).reverse(),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Datos para gráficos de productos
  const productCategoryData = {
    labels: Object.keys(stats.products.byCategory).map((category) => {
      const categoryNames = {
        FRUTA: "Frutas",
        HORTALIZA: "Hortalizas",
        VIANDA: "Viandas",
        CARNE_EMBUTIDO: "Carnes/Embutidos",
        OTRO: "Otros",
      };
      return categoryNames[category] || category;
    }),
    datasets: [
      {
        label: "Productos por categoría",
        data: Object.values(stats.products.byCategory),
        backgroundColor: [
          "#10B981",
          "#34D399",
          "#60A5FA",
          "#F87171",
          "#FBBF24",
        ],
      },
    ],
  };

  const productStatusData = {
    labels: ["Disponibles", "No disponibles", "Programa SAS"],
    datasets: [
      {
        label: "Estado de productos",
        data: [
          stats.products.active,
          stats.products.inactive,
          stats.products.sasProgram,
        ],
        backgroundColor: ["#10B981", "#F87171", "#60A5FA"],
      },
    ],
  };

  const productGrowthData = {
    labels: stats.products.byMonth
      .map((item) => {
        const [year, month] = item.month.split("-");
        const date = new Date(year, month - 1);
        return date.toLocaleDateString("es-ES", {
          month: "short",
          year: "numeric",
        });
      })
      .reverse(),
    datasets: [
      {
        label: "Nuevos productos",
        data: stats.products.byMonth.map((item) => item.count).reverse(),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Datos para gráficos de mercados
  const marketGrowthData = {
    labels: stats.markets.byMonth
      .map((item) => {
        const [year, month] = item.month.split("-");
        const date = new Date(year, month - 1);
        return date.toLocaleDateString("es-ES", {
          month: "short",
          year: "numeric",
        });
      })
      .reverse(),
    datasets: [
      {
        label: "Nuevos mercados",
        data: stats.markets.byMonth.map((item) => item.count).reverse(),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Datos para gráficos de comentarios
  const ratingDistributionData = {
    labels: [
      "1 estrella",
      "2 estrellas",
      "3 estrellas",
      "4 estrellas",
      "5 estrellas",
    ],
    datasets: [
      {
        label: "Distribución de calificaciones",
        data: [
          stats.comments.ratingDistribution[1] || 0,
          stats.comments.ratingDistribution[2] || 0,
          stats.comments.ratingDistribution[3] || 0,
          stats.comments.ratingDistribution[4] || 0,
          stats.comments.ratingDistribution[5] || 0,
        ],
        backgroundColor: [
          "#EF4444",
          "#F87171",
          "#FBBF24",
          "#34D399",
          "#10B981",
        ],
      },
    ],
  };

  const commentGrowthData = {
    labels: stats.comments.byMonth
      .map((item) => {
        const [year, month] = item.month.split("-");
        const date = new Date(year, month - 1);
        return date.toLocaleDateString("es-ES", {
          month: "short",
          year: "numeric",
        });
      })
      .reverse(),
    datasets: [
      {
        label: "Nuevos comentarios",
        data: stats.comments.byMonth.map((item) => item.count).reverse(),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Datos para gráficos de productos base
  const baseProductCategoryData = {
    labels: Object.keys(stats.baseProducts.byCategory).map((category) => {
      const categoryNames = {
        FRUTA: "Frutas",
        HORTALIZA: "Hortalizas",
        VIANDA: "Viandas",
        CARNE_EMBUTIDO: "Carnes/Embutidos",
        OTRO: "Otros",
      };
      return categoryNames[category] || category;
    }),
    datasets: [
      {
        label: "Productos base por categoría",
        data: Object.values(stats.baseProducts.byCategory),
        backgroundColor: [
          "#10B981",
          "#34D399",
          "#60A5FA",
          "#F87171",
          "#FBBF24",
        ],
      },
    ],
  };

  // Opciones para gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Administrativo
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Bienvenido, {session.user.name}. Aquí puedes ver las estadísticas y
            métricas importantes del sistema.
          </p>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Link
            href="/dashboard/admin/users"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Usuarios</h3>
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">
                {stats.users.total}
              </div>
              <p className="mt-2 text-sm text-gray-600">Usuarios registrados</p>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/products"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Productos</h3>
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">
                {stats.products.total}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Productos en el sistema
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/markets"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Mercados</h3>
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">
                {stats.markets.total}
              </div>
              <p className="mt-2 text-sm text-gray-600">Mercados activos</p>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/products/base"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Productos Base
              </h3>
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">
                {stats.baseProducts.total}
              </div>
              <p className="mt-2 text-sm text-gray-600">Productos base</p>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/comments"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Comentarios
              </h3>
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">
                {stats.comments.total}
              </div>
              <p className="mt-2 text-sm text-gray-600">Comentarios totales</p>
            </div>
          </Link>
        </div>

        {/* Pestañas de navegación */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("general")}
              className={`${
                activeTab === "general"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Resumen General
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`${
                activeTab === "users"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`${
                activeTab === "products"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Productos
            </button>
            <button
              onClick={() => setActiveTab("markets")}
              className={`${
                activeTab === "markets"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Mercados
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`${
                activeTab === "comments"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Comentarios
            </button>
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === "general" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Crecimiento de usuarios
                </h3>
                <div className="h-64">
                  <Line data={userGrowthData} options={lineChartOptions} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Distribución de usuarios por rol
                </h3>
                <div className="h-64">
                  <Doughnut data={userRoleData} options={chartOptions} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Crecimiento de productos
                </h3>
                <div className="h-64">
                  <Line data={productGrowthData} options={lineChartOptions} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Estado de productos
                </h3>
                <div className="h-64">
                  <Pie data={productStatusData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Distribución de usuarios por rol
                </h3>
                <div className="h-80">
                  <Pie data={userRoleData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Crecimiento de usuarios
                </h3>
                <div className="h-80">
                  <Line data={userGrowthData} options={lineChartOptions} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resumen de usuarios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total de usuarios
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.users.total}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Administradores
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-green-600">
                    {stats.users.byRole.admin}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Gestores de mercado
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-blue-600">
                    {stats.users.byRole.manager}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Productos por categoría
                </h3>
                <div className="h-80">
                  <Pie data={productCategoryData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Estado de productos
                </h3>
                <div className="h-80">
                  <Doughnut data={productStatusData} options={chartOptions} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Crecimiento de productos
                </h3>
                <div className="h-80">
                  <Line data={productGrowthData} options={lineChartOptions} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Productos base por categoría
                </h3>
                <div className="h-80">
                  <Pie data={baseProductCategoryData} options={chartOptions} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resumen de productos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total de productos
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.products.total}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Productos disponibles
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-green-600">
                    {stats.products.active}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Productos no disponibles
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-red-600">
                    {stats.products.inactive}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Productos en programa SAS
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-blue-600">
                    {stats.products.sasProgram}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "markets" && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Crecimiento de mercados
              </h3>
              <div className="h-80">
                <Line data={marketGrowthData} options={lineChartOptions} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resumen de mercados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total de mercados
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.markets.total}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Promedio de productos por mercado
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-green-600">
                    {stats.markets.total > 0
                      ? (stats.products.total / stats.markets.total).toFixed(1)
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "comments" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Distribución de calificaciones
                </h3>
                <div className="h-80">
                  <Bar data={ratingDistributionData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Crecimiento de comentarios
                </h3>
                <div className="h-80">
                  <Line data={commentGrowthData} options={lineChartOptions} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resumen de comentarios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total de comentarios
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.comments.total}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Calificación promedio
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-yellow-500">
                    {stats.comments.averageRating} / 5
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
