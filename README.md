# BPJS Bridging for SIMRS.dev

Ini adalah aplikasi pendukung SIMRS.dev yang khusus untuk tujuan bridging ke server BPJS. Sengaja dibuat terpisah agar perubahan pada satu aplikasi tidak mengubah yang lain. Sebelum menggunakan atau mengubah kode pada aplikasi ini, harap pahami terlebih dahulu cara kerja aplikasi SIMRS.dev

# Ragam Bridging
- Antrian online FKRTL (`fkrtl.js`, `tindakan.js`, `kodepoli.js`)
- Rawat Inap Terintegrasi (`kamar.js`, `public/app.js`)

Aplikasi ini tidak berkomunikasi langsung dengan aplikasi SIMRS.dev, sehingga SIMRS.dev dapat digunakan secara independen tanpa aplikasi bridging ini. Aplikasi ini berinteraksi langsung dengan database yang digunakan oleh SIMRS.dev, namun tidak melakukan perubahan data apapun yang terdapat pada collection yang digunakan langsung oleh SIMRS.dev. Mengubah mayoritas logika pada SIMRS.dev dapat menyebabkan aplikasi ini tidak sesuai, maka pada masa pengembangan harap pertimbangkan logika keduanya.

Susunan bed yang digunakan oleh aplikasi bridging ini mengikuti susunan bed yang ada pada SIMRS.dev. Maka bila melakukan perubahan susunan bed, harap salin secara utuh susunan bed tersebut ke `kamar.js` variabel `beds` untuk menggantikan susunan bed yang sudah ada. Di dalam file `kamar.js` sudah tersedia fungsi untuk update otomatis ketersediaan bed ke server bpjs setiap 3 jam
sekali, juga disediakan interface update manual.

Lakukan penyesuaian tarif tindakan di `tindakan.js` sesuai dengan tarif rumah sakit sendiri. Pastikan gunakan array yang sama dengan yg dipakai di SIMRS.dev-nya.

Isikan variabel berikut ke `.env`
```
mongo=  // alamat database yang digunakan oleh aplikasi SIMRS.dev
dbname=  // nama database yang digunakan oleh aplikasi SIMRS.dev
username=  // username untuk digunakan oleh user BPJS, bebas
password=  // password untuk digunakan oleh user BPJS, bebas
base_url_dev=  // isikan variabel ini dengan alamat server development yang disediakan BPJS
secret_key=  // dapatkan dari BPJS setempat
cons_id=  // dapatkan dari BPJS setempat
kode_ppk=  // dapatkan dari BPJS setempat
base_url_prod=  // isikan variabel ini dengan alamat server production yang disediakan BPJS
stage=development  // ganti ke 'production' untuk pindah ke mode produksi
```