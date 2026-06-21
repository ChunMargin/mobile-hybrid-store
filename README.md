# Aplikasi Hybrid Store (Online & Offline Inventory Sync)

## Deskripsi Aplikasi
Aplikasi mobile E-Commerce hybrid yang memungkinkan transaksi pembelian secara online (oleh pelanggan) dan offline (di kasir toko). Aplikasi ini memiliki fitur utama untuk mengelola *state* stok barang secara *real-time*, sehingga jika terjadi pembelian melalui salah satu jalur, ketersediaan stok akan otomatis tersinkronisasi di kedua platform.

## Daftar API yang Digunakan
1. **FakeStore API**: Digunakan melalui Axios untuk melakukan *seeding* (menarik data awal) katalog produk ke dalam aplikasi.
2. **Firebase (BaaS)**: Menggunakan Firebase Authentication untuk login dan Cloud Firestore untuk sinkronisasi database stok.

## 3 Fitur Utama (Didemokan)
1. **Katalog Produk (Axios)**: Menarik dan menampilkan daftar barang dari API eksternal.
2. **Autentikasi Pengguna (Firebase Auth)**: Sistem Login/Register untuk membedakan *role* Kasir (Offline) dan Pelanggan (Online).
3. **Sinkronisasi Stok Real-time (Cloud Firestore & State)**: Mengurangi *state* stok barang secara langsung ketika terjadi *checkout*, baik dari sesi kasir maupun pelanggan.

## Pembagian Tugas (Skenario B - 2 Orang)

| Nama Anggota | Peran | Tugas & Tanggung Jawab Demo |
| :--- | :--- | :--- |
| [Nama Temanmu] | Anggota 1: Frontend & Axios Specialist | Merancang UI/UX, integrasi Axios ke API eksternal. **Demo:** Menjelaskan UI dan penarikan data Axios (Fitur 1). |
| [Nama Kamu] | Anggota 2: Backend, State & Firebase Specialist | Mengelola state lokal, setup integrasi Firebase Auth & Firestore. **Demo:** Menjelaskan manajemen data lokal dan arsitektur Firebase (Fitur 2 & 3). |
