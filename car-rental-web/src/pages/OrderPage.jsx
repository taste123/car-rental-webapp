import React, { useEffect, useState } from 'react';
import { getCars, createRental, decodeToken, getUserProfile } from '../services/api.js';

// Komponen Toast popup notifikasi di tengah dengan animasi
function Toast({ message, duration = 3000, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const hideTimeout = setTimeout(() => setVisible(false), duration);
    const removeTimeout = setTimeout(() => onClose(), duration + 500);
    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(removeTimeout);
    };
  }, [duration, onClose]);

  return (
    <div className={`toast-container ${visible ? 'show' : 'hide'}`}>
      {message}
      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(60, 60, 60, 0.9);
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          max-width: 90vw;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          opacity: 0;
          pointer-events: none;
          user-select: none;
          transition: opacity 0.5s ease;
          z-index: 9999;
        }
        .toast-container.show {
          opacity: 1;
          pointer-events: auto;
        }
        .toast-container.hide {
          opacity: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

// Komponen popup untuk validasi nama
function NameValidationPopup({ isVisible, onConfirm, onCancel }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nama Lengkap Diperlukan
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Untuk melanjutkan pemesanan, Anda perlu melengkapi nama lengkap terlebih dahulu. Silakan edit profil Anda.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Edit Profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderPage({ carId, token, onNavigate, role }) {
  const [car, setCar] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ startDate: '', endDate: '' });
  const [totalPrice, setTotalPrice] = useState(0);
  const [rentalDays, setRentalDays] = useState(0);
  const [showNameValidation, setShowNameValidation] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);

  // Fungsi tampilkan toast popup
  const showToast = (msg) => {
    setToastMessage(null); // reset dulu supaya pesan bisa muncul ulang meski sama
    setTimeout(() => setToastMessage(msg), 50);
  };

  // Fungsi untuk mengecek apakah nama kosong atau blank
  const isNameEmpty = (name) => {
    return !name || name.trim() === '' || name === '-';
  };

  // Fungsi untuk menangani konfirmasi edit profil
  const handleEditProfile = () => {
    setShowNameValidation(false);
    if (onNavigate) onNavigate('update-profile');
  };

  // Fungsi untuk membatalkan popup
  const handleCancelPopup = () => {
    setShowNameValidation(false);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const cars = await getCars();
        const foundCar = cars.find(c => String(c.id) === String(carId));
        if (!foundCar) throw new Error("Mobil tidak ditemukan.");
        setCar(foundCar);

        if (token) {
          const decoded = decodeToken(token);
          const userId = decoded?.user_id;
          if (userId) {
            const profile = await getUserProfile(token, userId);
            setUserProfile(profile);
          } else {
            setError("ID pengguna tidak ditemukan di token.");
          }
        } else {
          setError("Anda perlu login untuk melihat detail pemesanan.");
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Gagal mengambil data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [carId, token]);

  useEffect(() => {
    if (form.startDate && form.endDate && car) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setRentalDays(diffDays > 0 ? diffDays : (start.toDateString() === end.toDateString() ? 1 : 0));
      setTotalPrice((diffDays > 0 ? diffDays : (start.toDateString() === end.toDateString() ? 1 : 0)) * (car.rental_rate_per_day || car.price_per_day));
    } else {
      setRentalDays(0);
      setTotalPrice(0);
    }
  }, [form.startDate, form.endDate, car]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rentalDays <= 0) {
      showToast("Tanggal selesai harus setelah tanggal mulai (minimal 1 hari sewa).");
      return;
    }
    if (!token) {
      showToast("Silakan login terlebih dahulu.");
      if (onNavigate) onNavigate('login');
      return;
    }
    if (role !== 'customer') {
      showToast("Hanya customer yang dapat menyewa.");
      return;
    }

    // Cek apakah nama lengkap sudah diisi
    if (isNameEmpty(userProfile?.full_name)) {
      setShowNameValidation(true);
      return;
    }

    try {
      const startDateISO = form.startDate ? new Date(form.startDate + 'T00:00:00').toISOString() : '';
      const endDateISO = form.endDate ? new Date(form.endDate + 'T00:00:00').toISOString() : '';

      const result = await createRental({
        car_id: car.id,
        start_date: startDateISO,
        end_date: endDateISO,
      }, token);

      showToast(`Sukses! Rental ID: ${result.id}`);

      // Immediately redirect to my-rentals page
      if (onNavigate) onNavigate('my-rentals');

    } catch (err) {
      showToast('Gagal menyewa: ' + err.message);
    }
  };

  if (loading) return <div className="text-center mt-10 text-slate-500">Memuat data...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!car) return <div className="text-center mt-10 text-slate-500">Mobil tidak ditemukan.</div>;
  if (!userProfile) return <div className="text-center mt-10 text-red-500">Profil pengguna tidak tersedia.</div>;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <img
            src={car.image_url || 'https://placehold.co/600x400?text=No+Image'}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-64 object-cover rounded-lg bg-gray-100"
          />
          <h1 className="text-2xl font-bold text-slate-800">{car.brand} {car.model}</h1>
          <p className="text-slate-600">Tahun: {car.year}</p>
          <p className="text-slate-700">{car.description}</p>
          <div className="text-xl font-bold text-sky-600">
            Rp {(car.rental_rate_per_day || car.price_per_day)?.toLocaleString('id-ID')} <span className="text-base font-normal text-slate-500">/ hari</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-slate-800">Informasi Pemesan</h2>
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Username:</strong> {userProfile.username}</p>
              <p><strong>Nama:</strong> {userProfile.full_name || '-'}</p>
              <p><strong>Email:</strong> {userProfile.email}</p>
              <p><strong>Telepon:</strong> {userProfile.phone_number || '-'}</p>
              <p><strong>Alamat:</strong> {userProfile.address || '-'}</p>
            </div>
            {/* Tampilkan warning jika nama kosong */}
            {isNameEmpty(userProfile?.full_name) && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm text-yellow-800">
                    Nama lengkap diperlukan untuk melanjutkan pemesanan
                  </span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded px-3 py-2"
                required
                min={today}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded px-3 py-2"
                required
                min={form.startDate || today}
              />
            </div>

            {rentalDays > 0 && (
              <div className="bg-sky-50 text-center p-4 rounded-md border border-sky-100">
                <p className="text-slate-700 text-sm">Total ({rentalDays} hari)</p>
                <p className="text-2xl font-bold text-sky-600">Rp {totalPrice.toLocaleString('id-ID')}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-sky-600 text-white py-2 rounded font-semibold hover:bg-sky-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={rentalDays <= 0 || isNameEmpty(userProfile?.full_name)}
            >
              {isNameEmpty(userProfile?.full_name) 
                ? 'Lengkapi Nama Terlebih Dahulu' 
                : 'Sewa Sekarang'
              }
            </button>

            <div className="mt-4 bg-yellow-50 text-yellow-800 text-sm p-3 rounded-md border-l-4 border-yellow-500">
              <ul className="list-disc list-inside space-y-1">
                <li>Denda 10%/hari untuk keterlambatan (denda lebih lanjut didiskusikan dengan admin di kantor rental).</li>
                <li>Bertanggung jawab atas kondisi mobil.</li>
                <li>Kerusakan berat/hilang = sanksi penuh.</li>
                <li>Email: <a href="mailto:support@carrental.com" className="underline">support@carrental.com</a></li>
              </ul>
            </div>
          </form>
        </div>
      </div>

      {/* Tampilkan Toast jika ada pesan */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          duration={3000}
        />
      )}

      {/* Tampilkan popup validasi nama */}
      <NameValidationPopup
        isVisible={showNameValidation}
        onConfirm={handleEditProfile}
        onCancel={handleCancelPopup}
      />
    </div>
  );
}

export default OrderPage;
