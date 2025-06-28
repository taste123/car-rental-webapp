// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';

function Navbar({ currentPage, onNavigate, token, role, onLogout, onScrollToCars, onScrollToHomeTop }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const linkClasses = (page) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
            currentPage === page.toLowerCase()
                ? 'bg-sky-500 text-white shadow'
                : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
        }`;

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [profileRef]);

    const handleLogout = (e) => {
        e.preventDefault();
        onLogout();
        setIsProfileOpen(false);
        setIsMenuOpen(false);
    };

    const handleNavigate = (page) => {
        onNavigate(page);
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-4 z-50 rounded-xl mb-8 max-w-7xl mx-auto">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center cursor-pointer" onClick={() => onScrollToHomeTop()}>
                        <div className="flex-shrink-0 text-sky-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                        </div>
                        <span className="text-xl font-bold text-slate-800 ml-2">Rental Cepat</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        <button onClick={() => onScrollToHomeTop()} className={linkClasses('home')}>Home</button>

                        {token && role === 'customer' && (
                            <button onClick={onScrollToCars} className={linkClasses('vehicles')}>Cars</button>
                        )}
                        {token && role === 'customer' && (
                            <button onClick={() => handleNavigate('my-rentals')} className={linkClasses('my-rentals')}>My Rentals</button>
                        )}
                        {token && role === 'admin' && (
                            <>
                                <button onClick={() => handleNavigate('admin/cars')} className={linkClasses('admin/cars')}>Manage Cars</button>
                                <button onClick={() => handleNavigate('admin/rental-history')} className={linkClasses('admin/rental-history')}>Rental History</button>
                            </>
                        )}

                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                            {isProfileOpen && (
                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1" role="menu">
                                    {token ? (
                                        <>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleNavigate('profile');
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Profile
                                        </a>
                                        <a
                                            href="#"
                                            onClick={handleLogout}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Logout
                                        </a>
                                        </>
                                    ) : (
                                        <>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigate('login');
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Login
                                        </a>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigate('register');
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Register
                                        </a>
                                        </>
                                    )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} type="button" className="bg-slate-200 inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-white hover:bg-sky-500">
                            {isMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <button onClick={() => onScrollToHomeTop()} className={linkClasses('home')}>Home</button>

                    {token && role === 'customer' && (
                        <button onClick={onScrollToCars} className={linkClasses('vehicles')}>Cars</button>
                    )}

                    {token && role === 'customer' && (
                        <button onClick={() => handleNavigate('my-rentals')} className={linkClasses('my-rentals')}>My Rentals</button>
                    )}
                    
                    {token && (role === 'customer' || role === 'admin') && (
                        <button onClick={() => handleNavigate('profile')} className={linkClasses('profile')}>Profile</button>
                    )}

                    {token && role === 'admin' && (
                        <>
                            <button onClick={() => handleNavigate('admin/cars')} className={linkClasses('admin/cars')}>Manage Cars</button>
                            <button onClick={() => handleNavigate('admin/rental-history')} className={linkClasses('admin/rental-history')}>Rental History</button>
                        </>
                    )}

                    {!token && (
                        <>
                            <button onClick={() => handleNavigate('login')} className={linkClasses('login')}>Login</button>
                            <button onClick={() => handleNavigate('register')} className={linkClasses('register')}>Register</button>
                        </>
                    )}

                    {token && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onLogout();
                                setIsMenuOpen(false);
                            }}
                            className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100"
                        >
                            Logout
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}

export default Navbar;