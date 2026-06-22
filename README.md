# Aplikasi Peminjaman Alat Lab (Real-time Inventory Sync)

## Deskripsi Aplikasi
Aplikasi *mobile hybrid* yang di rancang untuk memanajemen perputaran peminjaman komponen dan alat praktikum di laboraterium. Aplikasi ini memastikan ketersediaan perangkat keras selalu tersinkronisasi secara real-time antara antarmuka Mahasiswa (sebagai peminjam) dan Admin Lab (sebagai pengelola).

Sistem ini mencegah terjadinya bentrok peminjaman pada perangkat yang jumlahnya terbatas,  Mikrokontroler (ESP32), Sensor (MPU6050), Multimeter, hingga Modul PLC. dengan memotong *state* stok secara presisi langsung dari *database* saat transaksi peminjaman terjadi.

## Daftar API & Layanan yang Digunakan
1. **API Eksternal (Axios)**: Digunakan untuk melakukan *seeding* atau menarik data awal katalog spesifikasi alat lab ke dalam aplikasi.
2. **Firebase (BaaS)**: 
   - **Firebase Authentication**: Untuk sistem login dan validasi hak akses pengguna.
   - **Cloud Firestore**: Untuk manajemen *database* NoSQL dan pendengar (*listener*) sinkronisasi stok alat secara *real-time*.

## 3 Fitur Utama (Didemokan)
1. **Katalog Inventaris Lab (Axios)**: Menarik dan menampilkan daftar alat dan komponen praktikum yang tersedia dari pangkalan data eksternal.
2. **Autentikasi Pengguna (Firebase Auth)**: Sistem Login/Register yang membedakan *role* akses antara **Admin Lab** (pengelola ketersediaan) dan **Mahasiswa** (peminjam).
3. **Sinkronisasi Stok Real-time (Cloud Firestore & State)**: Mengurangi *state* ketersediaan barang secara seketika (*live*) di seluruh perangkat ketika ada mahasiswa yang menekan tombol "Pinjam", mencegah peminjaman melebihi batas stok fisik di lab.

## Pembagian Tugas & Skenario Demo
Dokumentasi dan pengerjaan proyek ini dikembangkan secara kolaboratif oleh tim (Helena, Faris, et al.) dengan pembagian *role* sebagai berikut:

| Nama Anggota | Peran | Tugas & Tanggung Jawab Demo |
| :--- | :--- | :--- |
| **Faris** | Frontend & Axios Specialist | Merancang antarmuka (UI/UX) aplikasi dan mengintegrasikan Axios ke API eksternal. **Demo:** Menjelaskan UI dan alur penarikan data Axios untuk memunculkan daftar alat (Fitur 1). |
| **Helena** | Backend, State & Firebase Specialist | Mengelola arsitektur *state* lokal, setup integrasi Firebase Auth, dan Cloud Firestore. **Demo:** Menjelaskan manajemen data, validasi login, dan mendemonstrasikan sinkronisasi pemotongan stok *real-time* (Fitur 2 & 3). |
