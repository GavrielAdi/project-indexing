# Proyek Indexing dan Pencarian Dokumen (KP)

Sebuah aplikasi web full-stack yang memungkinkan pengguna untuk meng-upload berbagai jenis dokumen (PDF, DOCX, XLSX, TXT), mengindeks kontennya menggunakan algoritma custom (Positional Index & Trie), dan melakukan pencarian frasa dengan cepat. Aplikasi ini menggunakan arsitektur backend Python (Flask) dan frontend JavaScript (Next.js), dengan MongoDB sebagai database utama.

## Fitur Utama

-   **Upload Dokumen Multi-format**: Mendukung `.pdf`, `.docx`, `.xlsx`, dan `.txt`.
-   **Indexing Konten Cerdas**: Termasuk fallback ke **OCR (Optical Character Recognition)** untuk dokumen PDF berbasis gambar.
-   **Penyimpanan Berbasis Database**: Semua file dan hasil indeksnya disimpan di **MongoDB** menggunakan GridFS, tanpa penyimpanan file lokal permanen.
-   **Manajemen Dokumen**: Pengguna dapat melihat riwayat, memilih dokumen aktif untuk pencarian, dan menghapus dokumen dari database.
-   **Pencarian Frasa Cepat**: Menggunakan implementasi **Positional Index** untuk menemukan frasa yang tepat.
-   **Autocomplete**: Memberikan saran kata saat mengetik di kolom pencarian menggunakan struktur data **Trie**.
-   **UI Modern & Interaktif**: Dibangun dengan Next.js dan Tailwind CSS, menampilkan layout multi-halaman yang responsif.

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
    -   [Instalasi untuk Windows](https://github.com/UB-Mannheim/tesseract)
    -   Pastikan untuk menambahkan path instalasi Tesseract ke environment variable `PATH` Anda.

---

## Instalasi & Setup

1.  **Clone repository ini:**
    ```bash
    git clone https://github.com/GavrielAdi/project-indexing.git
    cd project-indexing
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    .\venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Setup Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```

---

## Menjalankan Aplikasi

Aplikasi ini membutuhkan **dua terminal** yang berjalan secara bersamaan.

1.  **Terminal 1 (Jalankan Backend):**
    ```bash
    cd backend
    python app.py
    ```
    Server backend akan berjalan di `http://127.0.0.1:5000`.

2.  **Terminal 2 (Jalankan Frontend):**
    ```bash
    cd frontend
    npm run dev
    ```
    Buka browser Anda dan kunjungi `http://localhost:3000`.
