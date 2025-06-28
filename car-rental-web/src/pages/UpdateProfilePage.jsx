// pages/UpdateProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { getUserProfile, updateProfile, decodeToken } from '../services/api.js';

const UpdateProfilePage = ({ token, onNavigate }) => {
    const [user, setUser] = useState(null); // State untuk menyimpan data user asli
    const [formData, setFormData] = useState({ // State untuk data form yang akan di-submit
        username: '',
        email: '',
        full_name: '',
        phone_number: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

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
                const userId = decoded?.user_id; 
                if (!userId) {
                    setError("ID pengguna tidak ditemukan di token. Silakan login ulang.");
                    setLoading(false);
                    return;
                }

                const data = await getUserProfile(token, userId);
                setUser(data); // Simpan data user asli
                // Inisialisasi form dengan data yang sudah ada
                setFormData({
                    username: data.username || '',
                    email: data.email || '',
                    full_name: data.full_name || '',
                    phone_number: data.phone_number || '',
                    address: data.address || ''
                });
            } catch (err) {
                console.error("Error fetching user profile for update:", err);
                setError(err.message || "Gagal memuat data profil untuk diperbarui.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return; // Pastikan user sudah terload

        setSubmitting(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const decoded = decodeToken(token);
            const userId = decoded?.user_id;

            // Buat objek update_data, hanya sertakan field yang berubah atau diisi
            const updateData = {};
            for (const key in formData) {
                // Periksa apakah nilai form berbeda dari nilai asli ATAU jika nilai form ada tapi nilai asli tidak ada
                if (formData[key] !== user[key] && !(!formData[key] && !user[key])) {
                     updateData[key] = formData[key];
                }
            }

            // Jika tidak ada perubahan yang terdeteksi, berikan pesan sukses tanpa mengirim request API
            if (Object.keys(updateData).length === 0) {
                setSuccessMessage("Tidak ada perubahan yang terdeteksi.");
                setSubmitting(false);
                return;
            }

            const updatedUser = await updateProfile(token, userId, updateData);
            setUser(updatedUser); // Update state user dengan data terbaru dari respons API
            // Perbarui formData juga agar mencerminkan data yang baru disimpan
            setFormData({
                username: updatedUser.username || '',
                email: updatedUser.email || '',
                full_name: updatedUser.full_name || '',
                phone_number: updatedUser.phone_number || '',
                address: updatedUser.address || ''
            });

            setSuccessMessage("Profil berhasil diperbarui!");

        } catch (err) {
            console.error("Error updating user profile:", err);
            setError(err.message || "Gagal memperbarui profil.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center text-slate-500">Memuat data profil...</div>;
    }

    if (error && !user) { // Tampilkan error fatal jika user tidak bisa dimuat
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">Edit Profil</h1>
            {successMessage && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">{successMessage}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-slate-700 text-sm font-bold mb-2">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-slate-700 text-sm font-bold mb-2">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="full_name" className="block text-slate-700 text-sm font-bold mb-2">Nama Lengkap:</label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div>
                    <label htmlFor="phone_number" className="block text-slate-700 text-sm font-bold mb-2">Nomor Telepon:</label>
                    <input
                        type="text"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div>
                    <label htmlFor="address" className="block text-slate-700 text-sm font-bold mb-2">Alamat:</label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline"
                    ></textarea>
                </div>
                <div className="text-center mt-6">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                    <button
                        type="button"
                        onClick={() => onNavigate('profile')}
                        className="ml-4 bg-gray-300 hover:bg-gray-400 text-slate-800 font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateProfilePage;