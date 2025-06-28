# Car Rental WebApp

Project ini terdiri dari dua bagian utama:  
- Backend API menggunakan FastAPI  
- Frontend Web App menggunakan teknologi web modern (React, Vite, JS)

---

## 🛠️ Cara Menjalankan

Untuk menjalankan aplikasi ini, kamu perlu menjalankan dua project secara bersamaan di dua terminal (atau dua jendela VSCode):

### 1. Backend API (FastAPI)

1. Buka terminal di folder `car_rental_api`
2. Buat dan aktifkan virtual environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate      # Windows
    source venv/bin/activate     # Mac/Linux
    ```
3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4. Jalankan server FastAPI dengan perintah:
    ```bash
    uvicorn main:app --reload
    ```
5. API akan berjalan di http://127.0.0.1:8000

---

### 2. Frontend Web App

1. Buka terminal baru di folder `car_rental_web`
2. Install dependencies dengan npm/yarn:
    ```bash
    npm install
    ```
3. Jalankan development server:
    ```bash
    npm run dev
    ```
4. Buka browser ke http://localhost:3000 (atau port yang ditampilkan di terminal)

## 🗂️ Struktur Proyek

```
car-rental-webapp/
├── car_rental_api/       # Backend API - FastAPI
│   ├── main.py           # Entry point API
│   └── ...
├── car_rental_web/       # Frontend Web App (React + Vite)
│   ├── src/
│   └── ...
└── README.md             # Dokumentasi ini
```


## ⚙️ Teknologi yang Digunakan

- Backend: FastAPI, Uvicorn, SQLAlchemy, Pydantic, Python-JOSE, Passlib, dll.
- Frontend: React, Vite.js, React Router, Axios, TailwindCSS
- Database: SQLite

---

## 📌 Catatan

- Pastikan kamu menjalankan backend API terlebih dahulu sebelum menjalankan frontend agar API bisa diakses.
- Jika ada error terkait package seperti `python-multipart` atau `email-validator`, pastikan sudah diinstall dengan `pip install -r requirements.txt`.
- Gunakan dua terminal berbeda untuk backend dan frontend agar keduanya berjalan paralel.

---

Kalau ada pertanyaan atau butuh bantuan, jangan ragu untuk kontak saya!

---

### Penulis  
Abel Eka Putra
