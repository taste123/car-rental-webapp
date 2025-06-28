import React, { useEffect, useState } from 'react';
import { getMyRentals, getCars } from '../services/api.js';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-400',
  ongoing: 'bg-blue-100 text-blue-700 border-blue-400',
  finished: 'bg-green-100 text-green-700 border-green-400',
  cancelled: 'bg-red-100 text-red-700 border-red-400',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-block px-3 py-1 rounded-full border font-semibold text-xs ${statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-400'}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

// Format tanggal + jam
function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Komponen hitung mundur
const CountdownTimer = ({ endTime }) => {
  const [remaining, setRemaining] = useState(getRemainingTime(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemainingTime(endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (remaining.total <= 0) return <div className="text-sm text-red-600 font-semibold">⏱ Waktu habis</div>;

  return (
    <div className="text-sm text-blue-600 font-medium">
      ⏳ Sisa waktu: <span className="font-bold">
        {remaining.days}h {remaining.hours}j {remaining.minutes}m {remaining.seconds}d
      </span>
    </div>
  );
};

function getRemainingTime(endTime) {
  const total = Date.parse(endTime) - Date.now();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
}

function MyRentalsPage({ token }) {
  const [rentals, setRentals] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [rentalsData, carsData] = await Promise.all([
          getMyRentals(token),
          getCars(token)
        ]);
        const sortedRentals = rentalsData.sort((a, b) => b.id - a.id);
        setRentals(sortedRentals);
        setCars(carsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const getCarDetails = (carId) => {
    return cars.find(c => c.id === carId);
  };

  const getCarName = (carId) => {
    const car = getCarDetails(carId);
    return car ? `${car.brand} ${car.model}` : `Car ID: ${carId}`;
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Rentals</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : rentals.length === 0 ? (
        <div>Belum ada pesanan sewa.</div>
      ) : (
        <div className="space-y-4">
          {rentals.map(rental => (
            <div key={rental.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex gap-4 flex-1">
                <div className="flex-shrink-0">
                  <img
                    src={getCarDetails(rental.car_id)?.image_url || "https://placehold.co/150x100?text=No+Image"}
                    alt={getCarName(rental.car_id)}
                    className="w-32 h-20 object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{getCarName(rental.car_id)}</div>
                  <div className="text-gray-600 text-sm">
                    <span className="block">
                      🕒 <span className="font-medium">Mulai:</span> {formatDateTime(rental.start_date)}
                    </span>
                    <span className="block">
                      ⏱️ <span className="font-medium">Selesai:</span> {formatDateTime(rental.end_date)}
                    </span>
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    💰 Total: <span className="font-semibold">Rp {rental.total_price?.toLocaleString('id-ID')}</span>
                  </div>
                  {rental.status === 'ongoing' && (
                    <CountdownTimer endTime={rental.end_date} />
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={rental.status || 'pending'} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRentalsPage;
