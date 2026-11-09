# Contact Management API

REST API untuk mengelola pengguna, kontak, dan alamat. Proyek ini menggunakan Express, Prisma dengan MySQL/MariaDB, serta Redis untuk rate limiting per token.

## Fitur

- Registrasi, login, dan autentikasi pengguna dengan token.
- Operasi CRUD untuk kontak dan alamat.
- Validasi input dan middleware penanganan error.
- Rate limit untuk endpoint terautentikasi: maksimal 2 request per token dalam jendela tetap 1 detik.
- Pengujian otomatis menggunakan Jest.
- Skrip uji beban k6 untuk membandingkan request dalam batas dan request yang melebihi batas.

## Teknologi

- Node.js (Prisma 7 memerlukan Node.js 20.19 atau lebih baru)
- Express
- Prisma ORM dan MySQL/MariaDB
- Redis
- Jest dan Supertest
- k6 untuk uji beban

## Struktur Proyek

```text
.
├── data.json
├── generated/
├── lib/
│   └── prisma.ts
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── application/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── web.js
│   ├── controller/
│   ├── error/
│   ├── middleware/
│   ├── router/
│   ├── services/
│   │   └── rate-limiter-service.js
│   ├── validation/
│   ├── main.js
│   ├── script1.js
│   ├── script2.js
│   ├── testApp.http
│   └── testRate.http
├── test/
├── package.json
├── prisma7.config.ts
├── tsconfig.json
└── README.md
```

## Prasyarat

- Node.js 20.19 atau lebih baru dan npm.
- MySQL atau MariaDB yang berjalan.
- Redis yang berjalan pada `127.0.0.1:6380` (konfigurasi saat ini di `src/application/redis.js`).
- k6 jika ingin menjalankan pengujian beban.

## Konfigurasi

Sebelum menjalankan perintah Prisma atau aplikasi, atur variabel lingkungan berikut di lingkungan lokal:

- `DATABASE_URL` — URL koneksi database yang digunakan Prisma CLI.
- `DATABASE_HOST` — host database yang digunakan adapter Prisma saat aplikasi berjalan.
- `DATABASE_USER` — pengguna database.
- `DATABASE_PASSWORD` — kata sandi pengguna database.
- `DATABASE_NAME` — nama database.

Jangan masukkan kredensial database atau token produksi ke dokumentasi, skrip pengujian, atau repositori publik. Skrip k6 yang disertakan menggunakan token uji; pastikan token tersebut hanya digunakan pada lingkungan pengembangan.

## Instalasi dan Database

Pasang dependensi:

```bash
npm install
```

Buat Prisma Client:

```bash
npx prisma generate
```

Terapkan migrasi yang tersedia ke database:

```bash
npx prisma migrate deploy
```

## Menjalankan Aplikasi

Build proyek dan jalankan server:

```bash
npm run build
npm start
```

API akan tersedia di `http://localhost:3000`. Pastikan database dan Redis sudah aktif sebelum menjalankan server.

## Rate Limiting

Middleware autentikasi memeriksa token pada header `Authorization`, mencari pengguna di database, lalu menjalankan rate limiter. Redis menyimpan penghitung terpisah untuk setiap token. Operasi `INCR` dan pemasangan TTL dilakukan dalam satu skrip Lua atomik; request pertama memulai jendela 1 detik dan hanya dua request pertama yang diizinkan. Request berikutnya dalam jendela tersebut menerima HTTP `429`.

Rate limiter saat ini menggunakan fixed window, bukan sliding window.

## API Endpoints

### Publik

| Method | Path               | Keterangan                 |
| ------ | ------------------ | -------------------------- |
| `POST` | `/api/users`       | Registrasi pengguna        |
| `POST` | `/api/users/login` | Login dan memperoleh token |

### Memerlukan autentikasi

Kirim token pada header `Authorization`.

| Method   | Path                                          | Keterangan                       |
| -------- | --------------------------------------------- | -------------------------------- |
| `GET`    | `/api/users/current`                          | Melihat profil pengguna saat ini |
| `PATCH`  | `/api/users/current`                          | Memperbarui profil pengguna      |
| `DELETE` | `/api/users/logout`                           | Logout                           |
| `POST`   | `/api/contacts`                               | Membuat kontak                   |
| `GET`    | `/api/contacts`                               | Mencari atau menampilkan kontak  |
| `GET`    | `/api/contacts/:contactId`                    | Melihat kontak                   |
| `PUT`    | `/api/contacts/:contactId`                    | Memperbarui kontak               |
| `DELETE` | `/api/contacts/:contactId`                    | Menghapus kontak                 |
| `POST`   | `/api/contacts/:contactId/address`            | Menambahkan alamat               |
| `GET`    | `/api/contacts/:contactId/address`            | Menampilkan alamat kontak        |
| `GET`    | `/api/contacts/:contactId/address/:addressId` | Melihat alamat                   |
| `PUT`    | `/api/contacts/:contactId/address/:addressId` | Memperbarui alamat               |
| `DELETE` | `/api/contacts/:contactId/address/:addressId` | Menghapus alamat                 |

## Pengujian

Jalankan pengujian otomatis:

```bash
npm test
```

Untuk menguji endpoint secara manual, gunakan request yang tersedia di `src/testApp.http` dan `src/testRate.http`.

### Uji beban k6

Jalankan server API dan Redis terlebih dahulu. Lalu, dari terminal lain jalankan salah satu skrip:

```bash
k6 run src/script1.js
k6 run src/script2.js
```

Kedua skrip mengirim request ke `GET /api/users/current` menggunakan 100 token unik, dengan 100 VU selama 60 detik:

- `script1.js` mengirim 2 request bersamaan per iterasi. Ini menguji beban yang sesuai dengan batas 2 request per token per detik.
- `script2.js` mengirim 4 request bersamaan per iterasi. Ini menguji request yang melebihi batas; hasil yang diharapkan sekitar 2 respons `200` dan 2 respons `429` per pasangan.

Threshold k6 pada setiap skrip menentukan apakah hasil memenuhi kriteria yang diatur di file tersebut. Pastikan token uji masih valid dan tersedia di database sebelum menjalankan tes.

## Lisensi

Proyek ini menggunakan lisensi ISC sebagaimana tercantum di `package.json`.
