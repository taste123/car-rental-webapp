import React, { useState, useEffect } from "react";
import { getCars, addCar, updateCar, deleteCar, updateCarAvailability } from "../services/api.js";

// Modal generik
function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// Form Add/Edit Car
function CarForm({ car, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    brand: car?.brand || "",
    model: car?.model || "",
    year: car?.year || "",
    price_per_day: car?.price_per_day || "",
    image_url: car?.image_url || "",
    description: car?.description || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(
      {
        ...formData,
        year: parseInt(formData.year, 10),
        price_per_day: parseFloat(formData.price_per_day),
      },
      car?.id
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-6">{car ? "Edit Car" : "Add New Car"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="Brand"
          required
          className="p-2 border rounded-md"
        />
        <input
          name="model"
          value={formData.model}
          onChange={handleChange}
          placeholder="Model"
          required
          className="p-2 border rounded-md"
        />
        <input
          name="year"
          type="number"
          value={formData.year}
          onChange={handleChange}
          placeholder="Year"
          required
          className="p-2 border rounded-md"
        />
        <input
          name="price_per_day"
          type="number"
          value={formData.price_per_day}
          onChange={handleChange}
          placeholder="Price per Day"
          required
          className="p-2 border rounded-md"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="p-2 border rounded-md md:col-span-2"
        />
        <input
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="Image URL"
          className="p-2 border rounded-md md:col-span-2"
        />
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600"
        >
          {car ? "Update" : "Add Car"}
        </button>
      </div>
    </form>
  );
}

function AdminCarsPage() {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [token] = useState(localStorage.getItem("access_token")); // pastikan sama dengan yang di simpan waktu login

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    if (!token) {
      setError("Anda harus login terlebih dahulu.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await getCars(token);
      setCars(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (car) => {
    setSelectedCar(car);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (car) => {
    setSelectedCar(car);
    setIsViewModalOpen(true);
  };

  const handleFormSubmit = async (formData, carId = null) => {
    try {
      if (!token) throw new Error("Token tidak tersedia, silakan login ulang.");
      if (carId) {
        await updateCar(carId, formData, token);
      } else {
        await addCar(formData, token);
      }
      await fetchCars();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedCar(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteClick = async (carId) => {
    if (!token) {
      alert("Token tidak tersedia, silakan login ulang.");
      return;
    }
    if (window.confirm("Apakah Anda yakin ingin menghapus mobil ini?")) {
      try {
        await deleteCar(carId, token);
        await fetchCars();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleToggleAvailability = async (carId, currentAvailable) => {
    if (!token) {
      alert("Token tidak tersedia, silakan login ulang.");
      return;
    }
    try {
      const newAvailable = currentAvailable ? 0 : 1;
      await updateCarAvailability(carId, newAvailable, token);
      await fetchCars();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Manage Cars</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors"
        >
          + Add New Car
        </button>
      </div>

      {isLoading && <p>Loading cars...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Brand & Model</th>
                <th className="px-6 py-3">Year</th>
                <th className="px-6 py-3">Price/day</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="p-4">
                    <img
                      src={
                        car.image_url ||
                        `https://placehold.co/100x60/e2e8f0/334155?text=${car.model}`
                      }
                      alt={car.model}
                      className="w-24 h-auto rounded-md object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {car.brand} {car.model}
                  </td>
                  <td className="px-6 py-4">{car.year}</td>
                  <td className="px-6 py-4">
                    Rp {car.price_per_day.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        car.available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {car.available ? "Available" : "Rented"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <button
                        onClick={() => handleViewClick(car)}
                        className="p-2 text-gray-500 hover:text-blue-600"
                        title="View"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEditClick(car)}
                        className="p-2 text-gray-500 hover:text-yellow-600"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleAvailability(car.id, car.available)}
                        className={`p-2 text-gray-500 hover:text-green-600 ${
                          car.available ? 'hover:text-red-600' : 'hover:text-green-600'
                        }`}
                        title={car.available ? "Mark as Rented" : "Mark as Available"}
                      >
                        {car.available ? "🚫" : "✅"}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(car.id)}
                        className="p-2 text-gray-500 hover:text-red-600"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add/Edit */}
      {(isAddModalOpen || isEditModalOpen) && (
        <Modal
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedCar(null);
          }}
        >
          <CarForm
            car={isEditModalOpen ? selectedCar : null}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
              setSelectedCar(null);
            }}
          />
        </Modal>
      )}

      {/* Modal View */}
      {isViewModalOpen && selectedCar && (
        <Modal onClose={() => setIsViewModalOpen(false)}>
          <h2 className="text-2xl font-bold mb-4">
            {selectedCar.brand} {selectedCar.model}
          </h2>
          <img
            src={
              selectedCar.image_url ||
              `https://placehold.co/400x250/e2e8f0/334155?text=${selectedCar.model}`
            }
            alt={selectedCar.model}
            className="w-full h-auto rounded-lg mb-4"
          />
          <p>
            <strong>Tahun:</strong> {selectedCar.year}
          </p>
          <p>
            <strong>Harga per Hari:</strong> Rp{" "}
            {selectedCar.price_per_day.toLocaleString("id-ID")}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {selectedCar.available ? "Tersedia" : "Disewa"}
          </p>
          <p className="mt-2">
            <strong>Deskripsi:</strong> {selectedCar.description || "Tidak ada deskripsi."}
          </p>
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="mt-6 w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </Modal>
      )}
    </div>
  );
}

export default AdminCarsPage;
