# Website Katering Cita Rasa Ayah (Netlify + Supabase)
1. Supabase: buat project, jalankan `supabase-schema.sql`.
2. Authentication > Email: matikan sign-up publik, buat akun admin.
3. Isi `js/supabase.js`: URL, anon key (bukan service_role), nomor WA, nama usaha.
4. Foto: lihat `assets/images/PANDUAN-FOTO.txt`.
5. Deploy: seret folder ke Netlify. Admin di `/admin/login.html`.

## Notifikasi email calon pesanan (Netlify Forms)
Form "pesanan-katering" (terdaftar di index.html, dikirim oleh js/pemesanan.js). Setelah deploy: Netlify > Forms > pilih form
> Form notifications > Add notification > Email notification > isi email pemilik. Email hanya notifikasi calon pesanan.
