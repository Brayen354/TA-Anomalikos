<?php

namespace Database\Seeders;

use App\Models\Fasilitas;
use App\Models\Favorit;
use App\Models\FotoKosan;
use App\Models\Kamar;
use App\Models\Kosan;
use App\Models\Pemesanan;
use App\Models\Pengguna;
use App\Models\Perawatan;
use App\Models\RiwayatDilihat;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's 
     */
    public function run(): void
    {
        
        // Pengguna (password semua: "password")
        $anton = $this->buatPengguna('Anton Morger', 'anton@partykosan.test', 'L');
        $amba = $this->buatPengguna('Amba Tukam', 'amba@partykosan.test', 'L');
        $sarah = $this->buatPengguna('Sarah Wijaya', 'sarah@partykosan.test', 'P');
        $budi = $this->buatPengguna('Budi Santoso', 'budi@partykosan.test', 'L');

        
        // Fasilitas
        $namaFasilitas = [
            'WiFi', 'AC', 'Smart TV', 'Water Heater',
            'Laundry', 'Dapur Bersama', 'Keamanan 24 Jam', 'CCTV',
        ];
        $fasilitas = collect($namaFasilitas)->mapWithKeys(
            fn ($nama) => [$nama => Fasilitas::create(['nama_fasilitas' => $nama])]
        );

       
        // Kosan (tiap kosan dimiliki salah satu pengguna)
        $kostAmba = Kosan::create([
            'id_pengguna' => $amba->id_pengguna,
            'nama_kosan' => 'Kost Mas Amba',
            'alamat' => 'Jl. Kaliurang KM 5, Yogyakarta',
            'landmark' => 'Dekat UGM',
            'tipe_kosan' => 'putra',
            'deskripsi' => 'Kos nyaman dan strategis dekat kampus.',
            'status' => 'aktif',
        ]);

        $kostSenayan = Kosan::create([
            'id_pengguna' => $sarah->id_pengguna,
            'nama_kosan' => 'Kost Elit Senayan',
            'alamat' => 'Jl. Asia Afrika No. 8, Jakarta Pusat',
            'landmark' => 'Dekat GBK',
            'tipe_kosan' => 'campur',
            'deskripsi' => 'Kos eksklusif dengan fasilitas lengkap.',
            'status' => 'aktif',
        ]);

        $pavilionMenteng = Kosan::create([
            'id_pengguna' => $anton->id_pengguna,
            'nama_kosan' => 'Pavilion Menteng',
            'alamat' => 'Jl. Menteng Raya No. 21, Jakarta Pusat',
            'landmark' => 'Dekat Taman Menteng',
            'tipe_kosan' => 'putri',
            'deskripsi' => 'Hunian asri di kawasan elit Menteng.',
            'status' => 'aktif',
        ]);

        // Foto thumbnail tiap kosan
        foreach ([$kostAmba, $kostSenayan, $pavilionMenteng] as $kosan) {
            FotoKosan::create([
                'id_kosan' => $kosan->id_kosan,
                'url_foto' => 'https://picsum.photos/seed/kosan'.$kosan->id_kosan.'/640/480',
                'is_thumbnail' => true,
            ]);
        }

        // Attach fasilitas ke kosan
        $kostAmba->fasilitas()->sync([
            $fasilitas['WiFi']->id_fasilitas,
            $fasilitas['Dapur Bersama']->id_fasilitas,
            $fasilitas['Keamanan 24 Jam']->id_fasilitas,
        ]);
        $kostSenayan->fasilitas()->sync([
            $fasilitas['WiFi']->id_fasilitas,
            $fasilitas['AC']->id_fasilitas,
            $fasilitas['Smart TV']->id_fasilitas,
            $fasilitas['Water Heater']->id_fasilitas,
            $fasilitas['CCTV']->id_fasilitas,
        ]);
        $pavilionMenteng->fasilitas()->sync([
            $fasilitas['WiFi']->id_fasilitas,
            $fasilitas['AC']->id_fasilitas,
            $fasilitas['Laundry']->id_fasilitas,
        ]);

    
        // Kamar
        $a101 = Kamar::create([
            'id_kosan' => $kostAmba->id_kosan,
            'no_kamar' => 'A-101', 'harga_bulanan' => 1200000,
            'status' => 'aktif', 'ukuran' => '3x3', 'jenis_kasur' => 'single',
        ]);
        $a102 = Kamar::create([
            'id_kosan' => $kostAmba->id_kosan,
            'no_kamar' => 'A-102', 'harga_bulanan' => 1350000,
            'status' => 'aktif', 'ukuran' => '3x4', 'jenis_kasur' => 'single',
        ]);
        $b201 = Kamar::create([
            'id_kosan' => $kostSenayan->id_kosan,
            'no_kamar' => 'B-201', 'harga_bulanan' => 2500000,
            'status' => 'aktif', 'ukuran' => '4x4', 'jenis_kasur' => 'queen',
        ]);
        // B-202 aktif & otomatis "terisi" karena ada pemesanan aktif (lihat di bawah)
        $b202 = Kamar::create([
            'id_kosan' => $kostSenayan->id_kosan,
            'no_kamar' => 'B-202', 'harga_bulanan' => 2750000,
            'status' => 'aktif', 'ukuran' => '4x4', 'jenis_kasur' => 'queen',
        ]);

        
        // Favorit (Budi menyukai beberapa kos)
        Favorit::create(['id_pengguna' => $budi->id_pengguna, 'id_kosan' => $kostAmba->id_kosan]);
        Favorit::create(['id_pengguna' => $budi->id_pengguna, 'id_kosan' => $kostSenayan->id_kosan]);

        
        // Riwayat dilihat (Budi melihat beberapa kamar)
        foreach ([$a101, $a102, $b201] as $i => $kamar) {
            RiwayatDilihat::create([
                'id_pengguna' => $budi->id_pengguna,
                'id_kamar' => $kamar->id_kamar,
                'dilihat_at' => now()->subDays($i + 1),
            ]);
        }


        // Pemesanan
        // Menunggu konfirmasi — kamar A-101 tetap tersedia.
        Pemesanan::create([
            'id_pengguna' => $budi->id_pengguna,
            'id_kamar' => $a101->id_kamar,
            'tanggal_pengajuan' => now()->subDays(2),
            'durasi_bulan' => 6,
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2027-01-01',
            'total_harga' => $a101->harga_bulanan * 6,
            'status' => 'menunggu_konfirmasi',
        ]);

        // Berhasil — kamar B-202 berstatus terisi (lihat di atas).
        Pemesanan::create([
            'id_pengguna' => $budi->id_pengguna,
            'id_kamar' => $b202->id_kamar,
            'tanggal_pengajuan' => now()->subDays(10),
            'durasi_bulan' => 12,
            'tanggal_mulai' => '2026-06-01',
            'tanggal_selesai' => '2027-06-01',
            'total_harga' => $b202->harga_bulanan * 12,
            'catatan_pemilik' => 'Silakan datang sesuai jadwal yang disepakati.',
            'status' => 'aktif',
        ]);


        // Perawatan kamar
        Perawatan::create([
            'id_kamar' => $a101->id_kamar,
            'judul' => 'AC tidak dingin',
            'deskripsi' => 'AC mengeluarkan suara berisik dan tidak dingin.',
            'kategori' => 'AC',
            'prioritas' => 'high',
            'status' => 'tertunda',
            'tanggal_laporan' => now()->subDays(3),
        ]);
        Perawatan::create([
            'id_kamar' => $a102->id_kamar,
            'judul' => 'Lampu kamar mati',
            'deskripsi' => 'Lampu utama kamar tidak menyala.',
            'kategori' => 'Listrik',
            'prioritas' => 'medium',
            'status' => 'tertunda',
            'tanggal_laporan' => now()->subDays(1),
        ]);
        Perawatan::create([
            'id_kamar' => $b201->id_kamar,
            'judul' => 'Keran bocor',
            'deskripsi' => 'Keran kamar mandi menetes terus.',
            'kategori' => 'Kamar Mandi',
            'prioritas' => 'low',
            'status' => 'selesai',
            'tanggal_laporan' => now()->subDays(15),
            'tanggal_selesai' => now()->subDays(12),
        ]);

    }

    /**
     * Buat pengguna sekaligus pengaturan privasi default-nya.
     */
    protected function buatPengguna(string $nama, string $email, string $jenisKelamin): Pengguna
    {
        $pengguna = Pengguna::create([
            'nama' => $nama,
            'email' => $email,
            'password' => 'password',
            'no_telp' => '0812'.fake()->numerify('########'),
            'jenis_kelamin' => $jenisKelamin,
        ]);

        $pengguna->pengaturanPrivasi()->create([
            'informasi_umum' => true,
            'informasi_data_diri' => true,
            'riwayat_aktivitas' => true,
            'riwayat_pencarian_kos' => true,
        ]);

        return $pengguna;
    }
}
