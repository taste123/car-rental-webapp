import React from "react";

function VehicleCard({ vehicle, onNavigate }) {
  const isAvailable = vehicle.available === 1 || vehicle.available === true;

  const handleRentClick = () => {
    if (!isAvailable) {
      alert("Kendaraan ini tidak tersedia untuk disewa.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Silakan login terlebih dahulu untuk menyewa kendaraan.");
      if (onNavigate) onNavigate('login');
      return;
    }

    if (onNavigate) onNavigate(`order/${vehicle.id}`);
  };

  return (
    <div className={`border rounded-lg p-4 shadow transition-transform duration-300 transform hover:-translate-y-1 hover:scale-105 ${!isAvailable ? 'opacity-60' : 'hover:shadow-lg'}`}>
      <div className="relative">
        <img
          src={vehicle.image_url || "https://placehold.co/400x250?text=No+Image"}
          alt={`${vehicle.brand || ""} ${vehicle.model || ""}`}
          className="w-full h-48 object-cover rounded-md"
        />
        <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
          isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <h3 className="mt-4 font-bold text-lg text-slate-800">
        {vehicle.brand ?? "-"} {vehicle.model ?? "-"}
      </h3>
      <p className="text-gray-600">Tahun: {vehicle.year ?? "-"}</p>
      <p className="text-gray-700 font-semibold">
        Harga per hari: Rp {vehicle.price_per_day?.toLocaleString("id-ID") ?? "-"}
      </p>
      {vehicle.description && (
        <p className="mt-2 text-gray-600 text-sm line-clamp-3">{vehicle.description}</p>
      )}

      <button
        onClick={handleRentClick}
        disabled={!isAvailable}
        className={`mt-4 w-full font-bold py-2 px-4 rounded-lg transition ${
          isAvailable ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-600 cursor-not-allowed'
        }`}
      >
        {isAvailable ? 'Sewa' : 'Tidak Tersedia'}
      </button>
    </div>
  );
}

export default VehicleCard;
