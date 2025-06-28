// HomePage.jsx
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { getCars } from '../services/api.js';
import VehicleCard from '../components/VehicleCard.jsx';

const HomePage = forwardRef(({ token, onNavigate }, ref) => {
    const carListRef = useRef(null);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useImperativeHandle(ref, () => ({
        scrollToCars: () => {
            carListRef.current?.scrollIntoView({ behavior: 'smooth' });
        },
        // Fungsi tambahan untuk scroll ke bagian atas hero
        scrollToTop: () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }));

    useEffect(() => {
        async function fetchCars() {
            setLoading(true);
            setError(null);
            try {
                if (token) {
                    const cars = await getCars(token);
                    setVehicles(cars);
                } else {
                    setVehicles([]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchCars();
    }, [token]);

    const handleScrollToCars = () => {
        carListRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="w-full">
            {/* HERO SECTION */}
            <div className="hero-bg relative text-white rounded-xl shadow-lg overflow-hidden h-[400px] md:h-[500px] flex items-center">
                {/* Gradient overlay untuk efek yang lebih profesional */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 opacity-75"></div>
                <div className="relative w-full h-full p-8 md:p-16 flex flex-col justify-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-wide drop-shadow-lg">
                        Sewa Mobil Mudah & Cepat
                    </h1>
                    <p className="text-lg md:text-xl mb-8 max-w-2xl drop-shadow-md">
                        Temukan mobil yang sempurna untuk perjalanan Anda berikutnya dengan harga terbaik dan layanan terpercaya. Nikmati perjalanan Anda tanpa khawatir!
                    </p>
                    <button 
                        onClick={handleScrollToCars} 
                        className="bg-sky-600 hover:bg-sky-700 transition duration-300 ease-in-out text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        Lihat Pilihan Mobil
                    </button>
                </div>
            </div>

            {/* SECTION DIVIDER */}
            <div className="mt-12 flex justify-center">
                <hr className="w-1/2 border-t-2 border-slate-300" />
            </div>

            {/* VEHICLE LISTING SECTION */}
            <div className="mt-16 px-4 md:px-8" ref={carListRef}>
                <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center border-b-2 border-slate-200 pb-4">
                    Armada Populer Kami
                </h2>
                {loading ? (
                    <div className="text-center text-slate-500">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : vehicles.length === 0 ? (
                    <div className="text-center text-slate-500">Tidak ada mobil tersedia.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vehicles.slice(0, 3).map(vehicle => (
                            <VehicleCard key={vehicle.id} vehicle={vehicle} onNavigate={onNavigate} />
                        ))}
                    </div>
                )}
            </div>

            {/* CALL-TO-ACTION BANNER (opsional, menambah kesan profesional) */}
            <div className="mt-16 bg-slate-50 py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Butuh Informasi Lebih Lanjut?</h3>
                    <p className="text-slate-600 mb-6">
                        Hubungi customer service kami untuk mendapatkan penawaran khusus dan informasi terbaru seputar rental mobil. Layanan profesional kami siap membantu Anda.
                    </p>
                    <a 
                        href="mailto:support@rentalcepat.com" 
                        className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-full shadow transition duration-300"
                    >
                        Hubungi Kami
                    </a>
                </div>
            </div>
        </div>
    );
});

export default HomePage;
