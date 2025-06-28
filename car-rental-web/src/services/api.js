// src/services/api.js (Kode api.js yang sudah diperbaiki dan dioptimalkan)

const API_BASE_URL = "http://localhost:8000"; // Sesuaikan jika API Anda berjalan di port lain

// --- Helper: Simple JWT decoder untuk ambil data payload token ---
// PASTIKAN HANYA ADA SATU DEFINISI FUNGSI INI
export function decodeToken(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Token invalid:", e);
    return null;
  }
}

// --- Fungsi API Otentikasi & User ---

export async function registerUser({ username, email, password, role, full_name, phone_number, address }) {
  // Tambahkan full_name, phone_number, address ke payload registrasi
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, role, full_name, phone_number, address }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Gagal registrasi");
  }

  return await response.json();
}

export async function loginUser(username, password) {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  const response = await fetch(`${API_BASE_URL}/users/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Gagal login");
  }

  return await response.json();
}

export async function getUserProfile(token, userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Gagal mengambil profil pengguna');
  }
  return response.json();
}

export async function updateProfile(token, userId, userData) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Gagal memperbarui profil');
  }
  return response.json();
}

// --- Fungsi API untuk Mobil ---

export async function getCars() {
  // Sesuai dengan backend Anda, endpoint /cars adalah PUBLIK (tidak memerlukan Authorization header)
  const response = await fetch(`${API_BASE_URL}/cars`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Gagal mengambil data mobil");
  }

  return await response.json(); // array mobil
}

export async function addCar(carData, token) {
  const response = await fetch(`${API_BASE_URL}/cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(carData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Gagal menambahkan mobil");
  }

  return await response.json();
}

export async function updateCar(carId, carData, token) {
  const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(carData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Gagal mengupdate mobil");
  }

  return await response.json();
}

export async function deleteCar(carId, token) {
  const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Gagal menghapus mobil");
  }

  return true; // Biasanya delete tidak mengembalikan json, cukup status OK
}

export async function updateCarAvailability(carId, available, token) {
  // Memanggil endpoint PUT /cars/{car_id}/availability yang spesifik di backend FastAPI
  const response = await fetch(`${API_BASE_URL}/cars/${carId}/availability`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ available: available }), // Kirim payload sesuai schemas.CarAvailabilityUpdate
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Gagal mengupdate ketersediaan mobil");
  }

  return await response.json();
}

// --- Fungsi API untuk Rental ---

export async function createRental(rentalData, token) {
  // Console logs dihapus agar lebih bersih, hanya jika Anda sudah selesai debugging
  // console.log('API: Creating rental with data:', rentalData);
  // console.log('API: Using token:', token);
  // console.log('API: Base URL:', API_BASE_URL);

  try {
    const response = await fetch(`${API_BASE_URL}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(rentalData),
    });

    // console.log('API: Response status:', response.status);
    // console.log('API: Response headers:', response.headers);

    if (!response.ok) {
      const errorData = await response.json();
      // console.error('API: Error response:', errorData);
      throw new Error(errorData.detail || "Gagal membuat rental");
    }

    const result = await response.json();
    // console.log('API: Rental created successfully:', result);
    return result;
  } catch (error) {
    // console.error('API: Network or parsing error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Tidak dapat terhubung ke server. Pastikan server backend berjalan.');
    }
    throw error;
  }
}

export async function getMyRentals(token) {
  // console.log('API: Getting my rentals with token:', token);

  const response = await fetch(`${API_BASE_URL}/rentals/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  // console.log('API: getMyRentals response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    // console.error('API: getMyRentals error:', errorData);
    throw new Error(errorData.detail || "Gagal mengambil data sewa Anda");
  }

  const result = await response.json();
  // console.log('API: getMyRentals result:', result);
  return result;
}

export async function getAllRentals(token) {
  // console.log('API: Getting all rentals with token:', token);

  const response = await fetch(`${API_BASE_URL}/rentals`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  // console.log('API: getAllRentals response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    // console.error('API: getAllRentals error:', errorData);
    throw new Error(errorData.detail || "Gagal mengambil data semua sewa");
  }

  const result = await response.json();
  // console.log('API: getAllRentals result:', result);
  return result;
}

export async function updateRentalStatus(rentalId, status, token) {
  const response = await fetch(`${API_BASE_URL}/rentals/${rentalId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Gagal mengupdate status rental menjadi ${status}`);
  }

  return await response.json();
}

// --- Fungsi Pengujian API (Opsional, untuk debugging/development) ---

export async function testApiConnection(token) {
  // console.log('Testing API connection...');
  try {
    const response = await fetch(`${API_BASE_URL}/cars`, { // Menggunakan /cars yang publik
      method: "GET",
      // Tidak perlu Authorization header jika endpoint ini publik
      // headers: { "Authorization": `Bearer ${token}` } // Uncomment jika Anda ingin menguji akses dengan token
    });
    return response.ok;
  } catch (error) {
    // console.error('Test API connection error:', error);
    return false;
  }
}

export async function testApiAccess() {
  // console.log('Testing API access...');
  try {
    const response = await fetch(`${API_BASE_URL}/cars`, { method: "GET" });
    return response.ok;
  } catch (error) {
    // console.error('API access test network error:', error);
    return false;
  }
}