return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex flex-wrap gap-4 mb-6">
      <select
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="name" className="text-gray-800">
          Nombre
        </option>
        <option value="price" className="text-gray-800">
          Precio
        </option>
        <option value="rating" className="text-gray-800">
          Valoración
        </option>
      </select>

      <select
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
        value={marketFilter}
        onChange={(e) => setMarketFilter(e.target.value)}
      >
        <option value="" className="text-gray-800">
          Todos los mercados
        </option>
        {markets.map((market) => (
          <option key={market.id} value={market.id} className="text-gray-800">
            {market.name}
          </option>
        ))}
      </select>

      <select
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
        value={priceFilter}
        onChange={(e) => setPriceFilter(e.target.value)}
      >
        <option value="" className="text-gray-800">
          Todos los precios
        </option>
        <option value="0-10" className="text-gray-800">
          $0 - $10
        </option>
        <option value="10-20" className="text-gray-800">
          $10 - $20
        </option>
        <option value="20-50" className="text-gray-800">
          $20 - $50
        </option>
        <option value="50+" className="text-gray-800">
          $50+
        </option>
      </select>

      <select
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
        value={ratingFilter}
        onChange={(e) => setRatingFilter(e.target.value)}
      >
        <option value="" className="text-gray-800">
          Todas las valoraciones
        </option>
        <option value="4" className="text-gray-800">
          4+ estrellas
        </option>
        <option value="3" className="text-gray-800">
          3+ estrellas
        </option>
        <option value="2" className="text-gray-800">
          2+ estrellas
        </option>
      </select>
    </div>
    {/* Resto del contenido */}
  </div>
);
