# AI Rules — Running Status

Dokumen ini menjadi acuan aturan kerja pengembangan aplikasi web & PWA **Running Status** (React/TypeScript/Vite, Firestore, GitHub Actions ke GitHub Pages, dan Google AI Studio).

## Aturan Kerja Utama
1. **Gaya Bahasa:** Gunakan bahasa Indonesia yang singkat, kritis, dan santai dengan emoji seperlunya, langsung ke inti tanpa basa-basi panjang.
2. **Evaluasi Risiko Teknis:** Selalu evaluasi potensi bug, crash, race condition, layout overflow di layar HP sempit, atau regresi fitur sebelum menyusun rencana atau prompt implementasi.
3. **Kumpulkan Revisi Dulu:** Jangan membuat prompt Google AI Studio sebelum daftar perubahan/revisi rampung dan disetujui. Kumpulkan revisi dulu agar eksekusi bisa satu kali jalan dan hemat kuota.
4. **Klasifikasi Versi:** Setiap usulan perubahan wajib menyebutkan tipe rilis (`Major X.0.0`, `Minor 0.X.0`, atau `Bug Fix 0.0.X`) serta menjaga konsistensi nomor versi di seluruh bagian terkait.
5. **Konfirmasi Pekerjaan Besar:** Jika ada tugas berskala besar atau berisiko timeout, beri tahu dulu sebelum eksekusi untuk konfirmasi.
6. **Proteksi Struktur Inti:** Selalu pertahankan keutuhan konfigurasi Firebase/Firestore, workflow `.github/workflows/*.yml`, serta fitur inti yang sudah ada kecuali diminta diubah secara eksplisit.
7. **Format Footer:** Saat membuat atau merujuk footer aplikasi baru, gunakan format low-key: `©2026 — Developed by FIKRI` (tanpa nomor versi jika versi sudah tampil di header).
8. **Format Output Akhir Update:** Di akhir setiap pengerjaan/update kode di AI Studio, selalu sertakan **changelog**, **catatan kritis teknis**, dan **saran lanjutan** masing-masing di dalam `code block` terpisah agar mudah disalin dan dievaluasi balik bersama Gemini.
