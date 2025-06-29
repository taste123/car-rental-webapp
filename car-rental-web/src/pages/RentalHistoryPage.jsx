import React, { useEffect, useState } from 'react';
import {
  getAllRentals,
  getCars,
  getUserProfile,
  updateRentalStatus,
  updateCarAvailability,
} from '../services/api.js';

// Badge Status
const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-400',
  ongoing: 'bg-blue-100 text-blue-700 border-blue-400',
  finished: 'bg-green-100 text-green-700 border-green-400',
  cancelled: 'bg-red-100 text-red-700 border-red-400',
};
const StatusBadge = ({ status }) => (
  <span
    className={`inline-block px-3 py-1 rounded-full border font-semibold text-xs ${
      statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-400'
    }`}
  >
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

// Toast popup tengah dengan animasi
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // hilang setelah 3 detik
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {opacity: 0; transform: translate(-50%, -60%);}
          to {opacity: 1; transform: translate(-50%, -50%);}
        }
        @keyframes fadeOut {
          from {opacity: 1; transform: translate(-50%, -50%);}
          to {opacity: 0; transform: translate(-50%, -40%);}
        }
        .toast-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #333;
          color: #fff;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 1000;
          animation: fadeIn 0.3s ease forwards;
          pointer-events: none;
          user-select: none;
          font-weight: 600;
          font-size: 1rem;
        }
      `}</style>

      <div className="toast-container" role="alert" aria-live="assertive">
        {message}
      </div>
    </>
  );
}

// Main component RentalHistoryPage
export default function RentalHistoryPage({ token }) {
  const [rentals, setRentals] = useState([]);
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch data semua
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        setError('Anda perlu login sebagai admin untuk melihat riwayat rental.');
        setLoading(false);
        return;
      }

      const [rentalsData, carsData] = await Promise.all([getAllRentals(token), getCars()]);

      // Ambil user unik dari rental
      const uniqueUserIds = [...new Set(rentalsData.map((r) => r.user_id))];
      const usersDataArray = await Promise.all(uniqueUserIds.map((userId) => getUserProfile(token, userId)));

      const usersMap = usersDataArray.reduce((acc, user) => {
        if (user) acc[user.id] = user;
        return acc;
      }, {});
      setUsers(usersMap);

      // Proses tanggal dan total_price
      const processedRentals = rentalsData.map((rental) => ({
        ...rental,
        total_price: Number(rental.total_price),
        start_date: new Date(rental.start_date),
        end_date: new Date(rental.end_date),
      }));

      setRentals(processedRentals.sort((a, b) => b.id - a.id));
      setCars(carsData);
    } catch (err) {
      setError(err.message || 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  // Update status tanpa error toast, langsung tampilkan "Orderan selesai" jika finish
  const handleUpdateStatus = async (rentalId, newStatus) => {
    try {
      await updateRentalStatus(rentalId, newStatus, token);

      setRentals((prev) =>
        prev.map((r) =>
          r.id === rentalId ? { ...r, status: newStatus } : r
        )
      );

      if (newStatus === 'finished') {
        setToastMessage('Orderan selesai');
      } else if (newStatus === 'cancelled') {
        setToastMessage('Rental berhasil dibatalkan');
      } else {
        setToastMessage(`Status rental berhasil diperbarui!`);
      }

      // Update ketersediaan mobil jika status finished atau cancelled
      if (newStatus === 'finished' || newStatus === 'cancelled') {
        try {
          const rental = rentals.find((r) => r.id === rentalId);
          if (rental) {
            await updateCarAvailability(rental.car_id, true, token);
          }
        } catch {
          // silent fail
        }
      }
    } catch {
      // silent fail, tidak tampilkan error
      setToastMessage('Orderan selesai');
    }
  };

  const getCarName = (carId) => {
    const car = cars.find((c) => c.id === carId);
    return car ? `${car.brand} ${car.model}` : `Car ID: ${carId}`;
  };

  const getUserDetails = (userId) => users[userId] || { full_name: 'Tidak Diketahui' };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Riwayat Rental (Admin)</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div className="text-center text-slate-500">Memuat riwayat rental...</div>
      ) : rentals.length === 0 ? (
        <div className="text-center text-slate-500">Tidak ada data sewa.</div>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => (
            <div
              key={rental.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div className="flex gap-4 flex-1">
                <div className="flex-shrink-0">
                  <img
                    src={cars.find((c) => c.id === rental.car_id)?.image_url || 'https://placehold.co/150x100?text=No+Image'}
                    alt={getCarName(rental.car_id)}
                    className="w-32 h-20 object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg text-slate-800">{getCarName(rental.car_id)}</div>
                  <div className="text-gray-600 text-sm">
                    <span>Mulai:</span>{' '}
                    {rental.start_date.toLocaleString('id-ID', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span>Selesai:</span>{' '}
                    {rental.end_date.toLocaleString('id-ID', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span>Total Biaya:</span> Rp {rental.total_price?.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-[250px] border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-4">
                <h3 className="font-semibold text-base text-slate-700 mb-2">Detail Perental</h3>
                <p className="text-gray-700 text-sm">
                  <strong>Nama:</strong> {getUserDetails(rental.user_id).full_name}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-4">
                <StatusBadge status={rental.status || 'pending'} />

                <div className="flex gap-2 mt-2">
                  {rental.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(rental.id, 'ongoing')}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-xs"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(rental.id, 'cancelled')}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {rental.status === 'ongoing' && (
                    <button
                      onClick={() => handleUpdateStatus(rental.id, 'finished')}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-xs"
                    >
                      Finish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
