import React, { useState } from "react";
import { registerUser } from "../services/api.js";

function RegisterPage({ onNavigate }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
        // Pastikan role dalam lowercase
        const normalizedRole = role.toLowerCase();

        await registerUser({ username, email, password, role: normalizedRole });
        setSuccess("Registrasi berhasil! Anda akan diarahkan ke halaman login.");
        setUsername("");
        setEmail("");
        setPassword("");
        setRole("customer");
        setTimeout(() => onNavigate("login"), 2000);
    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
    };

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Buat Akun Baru
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Daftar sebagai
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && (
            <p className="text-sm text-center text-red-600">{error}</p>
          )}
          {success && (
            <p className="text-sm text-center text-green-600">{success}</p>
          )}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 font-bold text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:bg-sky-300"
            >
              {isLoading ? "Mendaftarkan..." : "Create Account"}
            </button>
          </div>
          <p className="text-sm text-center text-gray-600">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => onNavigate("login")}
              className="font-medium text-sky-600 hover:text-sky-500"
            >
              Login di sini
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
