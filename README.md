# Proyek Indexing dan Pencarian Dokumen (KP)

Sebuah aplikasi web full-stack yang memungkinkan pengguna untuk meng-upload berbagai jenis dokumen (PDF, DOCX, XLSX, TXT), mengindeks kontennya menggunakan algoritma custom (Positional Index & Trie), dan melakukan pencarian frasa dengan cepat. Aplikasi ini menggunakan arsitektur backend Python (Flask) dan frontend JavaScript (Next.js), dengan MongoDB sebagai database utama.

---

## Fitur Utama

-   **Upload Dokumen Multi-format**: Mendukung `.pdf`, `.docx`, `.xlsx`, dan `.txt`.
-   **Indexing Konten Cerdas**: Termasuk fallback ke **OCR (Optical Character Recognition)** untuk dokumen PDF berbasis gambar.
-   **Penyimpanan Berbasis Database**: Semua file dan hasil indeksnya disimpan di **MongoDB** menggunakan GridFS, tanpa penyimpanan file lokal permanen.
-   **Manajemen Dokumen**: Pengguna dapat melihat riwayat, memilih dokumen aktif untuk pencarian, dan menghapus dokumen dari database.
-   **Pencarian Frasa Cepat**: Menggunakan implementasi **Positional Index** untuk menemukan frasa yang tepat.
-   **Autocomplete**: Memberikan saran kata saat mengetik di kolom pencarian menggunakan struktur data **Trie**.
-   **UI Modern & Interaktif**: Dibangun dengan Next.js dan Tailwind CSS, menampilkan layout multi-halaman yang responsif.
-   **Keamanan Terimplementasi**: Dilengkapi dengan berbagai lapisan keamanan, termasuk validasi konten file, sanitasi input, dan manajemen kredensial yang aman.

---

## Tech Stack

| Kategori | Teknologi |
| :--- | :--- |
| **Backend** | Python, Flask, PyMongo, GridFS |
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Database** | MongoDB (direkomendasikan via Atlas) |
| **Indexing** | Algoritma Custom (Positional Index & Trie) |
| **OCR** | Tesseract, PyTesseract, pdf2image |

---

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:
1.  **Python** (versi 3.9+)
2.  **Node.js** (versi 18+)
3.  **MongoDB**: Database yang aktif (lokal via Docker atau di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)).
4.  **Tesseract-OCR**: Engine untuk OCR.
    -   [Instalasi untuk Windows](https://github.com/UB-Mannheim/tesseract/wiki)
    -   Pastikan untuk menambahkan path instalasi Tesseract ke environment variable `PATH` Anda.

---

## Instalasi & Setup

1.  **Clone repository ini:**
    ```bash
    git clone [https://github.com/GavrielAdi/project-indexing.git](https://github.com/GavrielAdi/project-indexing.git)
    cd project-indexing
    ```

2.  **Setup Backend:**
    ```bash
    # Masuk ke folder backend
    cd backend

    # Buat dan aktifkan virtual environment
    python -m venv venv
    .\venv\Scripts\activate

    # Install semua library yang dibutuhkan dari requirements.txt
    pip install -r requirements.txt

    # BUAT FILE .env (SANGAT PENTING)
    # Buat file baru bernama .env di dalam folder backend/
    # Isi file tersebut dengan satu baris berikut, ganti dengan connection string Anda:
    # MONGO_URI="mongodb+srv://user:password@cluster.mongodb.net/..."
    ```

3.  **Setup Frontend:**
    ```bash
    # Dari folder root, masuk ke folder frontend
    cd ../frontend
    npm install
    
    # (Opsional) Buat file .env.local untuk pengembangan lokal
    # Buat file baru bernama .env.local di dalam folder frontend/
    # Isi file tersebut dengan satu baris ini:
    # NEXT_PUBLIC_API_URL="[http://127.0.0.1:5000](http://127.0.0.1:5000)"
    ```

---

## Menjalankan Aplikasi

Aplikasi ini membutuhkan **dua terminal** yang berjalan secara bersamaan.

1.  **Terminal 1 (Jalankan Backend):**
    ```bash
    # Dari folder root
    cd backend
    .\venv\Scripts\activate
    python app.py
    ```
    Server backend akan berjalan di `http://127.0.0.1:5000`.

2.  **Terminal 2 (Jalankan Frontend):**
    ```bash
    # Dari folder root
    cd frontend
    npm run dev
    ```
    Buka browser Anda dan kunjungi `http://localhost:3000`.

---

## Deployment & Pengembangan dengan Vercel

Aplikasi ini dirancang untuk di-deploy dengan frontend di Vercel dan backend berjalan di lingkungan lain (lokal atau server).

1.  **Deploy Frontend**: Push repository ini ke GitHub. Hubungkan repository ke Vercel dan deploy folder `frontend`.

2.  **Jalankan Backend Lokal dengan Ngrok**:
    -   Jalankan server backend Anda seperti biasa di `localhost:5000`.
    -   Gunakan `ngrok` untuk membuat terowongan publik ke server lokal Anda:
        ```bash
        # Ganti dengan domain statis ngrok Anda
        ngrok http --domain=nama-domain-anda.ngrok-free.app 5000
        ```

3.  **Konfigurasi Vercel**:
    -   Di dashboard Vercel, buka Proyek Anda -> Settings -> Environment Variables.
    -   Buat variabel baru:
        -   **Name**: `NEXT_PUBLIC_API_URL`
        -   **Value**: Alamat `https` dari Ngrok Anda (misal: `https://nama-domain-anda.ngrok-free.app`)
    -   Redeploy proyek Vercel Anda untuk menerapkan perubahan.

