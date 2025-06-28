import React, { useState, useEffect } from "react";
import VehicleCard from "../components/VehicleCard.jsx";

function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    async function fetchVehicles() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch cars data only - we'll use the 'available' column from database
        const response = await fetch(`${API_BASE_URL}/cars`);

        if (!response.ok) {
          throw new Error("Gagal mengambil data kendaraan");
        }

        const carsData = await response.json();
        setVehicles(carsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-800 mb-8">Pilihan Kendaraan</h1>

      {isLoading && <p>Loading kendaraan...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}

export default VehiclesPage;
