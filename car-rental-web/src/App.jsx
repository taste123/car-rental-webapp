// App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import VehiclesPage from './pages/VehiclesPage.jsx';
// import ServicesPage from './pages/ServicesPage.jsx'; // Uncomment jika digunakan
// import AboutPage from './pages/AboutPage.jsx';     // Uncomment jika digunakan
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import MyRentalsPage from './pages/MyRentalsPage.jsx';
import AdminCarsPage from './pages/AdminCarsPage.jsx';
import RentalHistoryPage from './pages/RentalHistoryPage.jsx';
import OrderPage from './pages/OrderPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx'; // Import halaman profil
import UpdateProfilePage from './pages/UpdateProfilePage.jsx'; // Import halaman update profil
import { decodeToken } from './services/api.js'; // Pastikan path ini benar

function App() {
    const [currentPage, setCurrentPage] = useState('home');

    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [role, setRole] = useState(localStorage.getItem('role'));

    // Ref to access HomePage's scroll function
    const homePageRef = React.useRef();

    const navigate = (page) => {
        const publicPages = ['home', 'login', 'register'];

        if (publicPages.includes(page)) {
            setCurrentPage(page);
            return;
        }

        // Jika halaman private tapi token belum ada, redirect ke login
        if (!token) {
            setCurrentPage('login');
            return;
        }

        // Proteksi halaman admin
        if (page.startsWith('admin/') && role !== 'admin') {
            alert('Akses ditolak. Hanya untuk admin.');
            return;
        }

        // Proteksi halaman customer & admin (untuk profil)
        if ((page === 'my-rentals' || page === 'profile' || page === 'update-profile') && !['customer', 'admin'].includes(role)) {
             alert('Akses ditolak. Anda harus login sebagai customer atau admin.');
             return;
        }

        // Larang admin mengakses halaman vehicles
        if (page === 'vehicles' && role === 'admin') {
            alert('Admin tidak boleh mengakses halaman kendaraan.');
            return;
        }

        setCurrentPage(page);
    };

    const handleLogin = (newToken) => {
        const decoded = decodeToken(newToken);
        // Pastikan 'role' dan 'user_id' ada di payload token saat Anda membuatnya di FastAPI
        const userRole = decoded?.role || null;
        // const userId = decoded?.user_id || null; // Jika Anda menyertakan user_id di token

        localStorage.setItem('access_token', newToken);
        localStorage.setItem('role', userRole);
        // Jika Anda menyimpan userId di localStorage:
        // localStorage.setItem('user_id', userId); 

        setToken(newToken);
        setRole(userRole);

        // Arahkan setelah login sesuai role
        if (userRole === 'admin') {
            navigate('admin/cars');
        } else {
            navigate('vehicles');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        // localStorage.removeItem('user_id'); // Hapus juga jika disimpan
        setToken(null);
        setRole(null);
        navigate('home');
    };

    // Scroll to car list if on home, otherwise navigate to home and then scroll
    const scrollToCars = () => {
        if (currentPage === 'home' && homePageRef.current) {
            homePageRef.current.scrollToCars();
        } else {
            setCurrentPage('home');
            // Wait for HomePage to mount, then scroll
            setTimeout(() => {
                if (homePageRef.current) homePageRef.current.scrollToCars();
            }, 100);
        }
    };

    const scrollToHomeTop = () => {
        if (currentPage === 'home' && homePageRef.current) {
            homePageRef.current.scrollToTop();
        } else {
            setCurrentPage('home');
            setTimeout(() => {
                if (homePageRef.current) homePageRef.current.scrollToTop();
            }, 100);
        }
    };

    useEffect(() => {
        // window.scrollTo(0, 0); // Pertahankan jika Anda ingin setiap navigasi ke atas
    }, [currentPage]);

    const renderPage = () => {
        if (currentPage.startsWith('order/')) {
            if (role !== 'customer') {
                alert('Akses ditolak. Hanya untuk customer.');
                setCurrentPage('home');
                return null;
            }
            const carId = currentPage.split('/')[1];
            return <OrderPage carId={carId} token={token} onNavigate={navigate} role={role} />;
        }
        switch (currentPage) {
            case 'vehicles':
                return <VehiclesPage token={token} role={role} onNavigate={navigate} />; {/* Passed onNavigate for VehicleCard in HomePage */}
            // case 'services': // Uncomment jika ada
            //     return <ServicesPage />;
            // case 'about':    // Uncomment jika ada
            //     return <AboutPage />;
            case 'login':
                return <LoginPage onLogin={handleLogin} onNavigate={navigate} />;
            case 'register':
                return <RegisterPage onNavigate={navigate} />;
            case 'my-rentals':
                return <MyRentalsPage token={token} />;
            case 'admin/cars':
                return <AdminCarsPage token={token} />;
            case 'admin/rental-history':
                return <RentalHistoryPage token={token} />;
            case 'profile': // Halaman profil baru
                return <ProfilePage token={token} onNavigate={navigate} />;
            case 'update-profile': // Halaman update profil baru
                return <UpdateProfilePage token={token} onNavigate={navigate} />;
            case 'home':
            default:
                return <HomePage ref={homePageRef} token={token} onNavigate={navigate} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar 
                currentPage={currentPage} 
                onNavigate={navigate} 
                token={token}
                role={role}
                onLogout={handleLogout} 
                onScrollToCars={scrollToCars}
                onScrollToHomeTop={scrollToHomeTop}
            />
            <div className="flex flex-col min-h-[calc(100vh-64px)]">
                <main className="flex-1">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="px-4 py-6 sm:px-0">
                            {renderPage()}
                        </div>
                    </div>
                </main>
                <footer className="bg-white border-t mt-auto">
                    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-slate-500">
                        <p>&copy; {new Date().getFullYear()} Rental Mobil Cepat. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default App;