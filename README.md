# BPJS Bridging for SIMRS.dev

Ini adalah aplikasi pendukung SIMRS.dev yang khusus untuk tujuan bridging ke server BPJS. Sengaja dibuat terpisah agar perubahan pada satu aplikasi tidak mengubah yang lain. Sebelum menggunakan atau mengubah kode pada aplikasi ini, harap pahami terlebih dahulu cara kerja aplikasi SIMRS.dev

# Ragam Bridging
- Antrian online FKRTL (`fkrtl.js`, `tindakan.js`, `kodepoli.js`)
- Rawat Inap Terintegrasi (`kamar.js`, `public/app.js`)

Aplikasi ini tidak berkomunikasi langsung dengan aplikasi SIMRS.dev, sehingga SIMRS.dev dapat digunakan secara independen tanpa aplikasi bridging ini. Aplikasi ini berinteraksi langsung dengan database yang digunakan oleh SIMRS.dev, namun tidak melakukan perubahan data apapun yang terdapat pada collection yang digunakan langsung oleh SIMRS.dev. Mengubah mayoritas logika pada SIMRS.dev dapat menyebabkan aplikasi ini tidak sesuai, maka pada masa pengembangan harap pertimbangkan logika keduanya.

Susunan bed yang digunakan oleh aplikasi bridging ini mengikuti susunan bed yang ada pada SIMRS.dev. Maka bila melakukan perubahan susunan bed, harap salin secara utuh susunan bed tersebut ke `kamar.js` menggantikan susunan bed yang sudah ada.