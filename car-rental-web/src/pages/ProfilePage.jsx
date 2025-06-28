// pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { getUserProfile, decodeToken } from '../services/api.js'; // Pastikan path ini benar

const ProfilePage = ({ token, onNavigate }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!token) {
                setError("Anda tidak terautentikasi. Silakan login.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const decoded = decodeToken(token);
                // Asumsi 'user_id' ada di payload token saat login
                // Atau gunakan 'sub' (username) dan panggil endpoint /users/me
                const userId = decoded?.user_id; 
                
                if (!userId) {
                    setError("ID pengguna tidak ditemukan di token. Silakan login ulang.");
                    setLoading(false);
                    return;
                }
                
                // Memanggil endpoint /users/{user_id}
                const data = await getUserProfile(token, userId);
                setUser(data);
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setError(err.message || "Gagal memuat profil pengguna. Pastikan Anda sudah login.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [token]);

    const handleEditProfile = () => {
        onNavigate('update-profile'); // Navigasi ke halaman update profil
    };

    if (loading) {
        return <div className="text-center text-slate-500">Memuat profil...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    if (!user) {
        return <div className="text-center text-slate-500">Profil tidak ditemukan.</div>;
    }

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">Profil Saya</h1>
            <div className="space-y-4 text-slate-700">
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                {/* Atribut baru */}
                <p><strong>Nama Lengkap:</strong> {user.full_name || '-'}</p>
                <p><strong>Nomor Telepon:</strong> {user.phone_number || '-'}</p>
                <p><strong>Alamat:</strong> {user.address || '-'}</p>
            </div>
            <div className="mt-8 text-center">
                <button
                    onClick={handleEditProfile}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                    Edit Profil
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;