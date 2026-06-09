<?php

namespace App\Http\Controllers;

use App\Models\Kamar;
use App\Models\Kosan;
use App\Models\Pemesanan;
use App\Models\Perawatan;

class DashboardController extends Controller
{
    // Endpoint utama dashboard ngasih ringkasan + daftar perawatan mendesak
    public function index()
    {
        $idPengguna = auth('api')->id();

    // Kumpulin id_kosan dari tabel Kosan punya si user
        $kosanIds = Kosan::where('id_pengguna', $idPengguna)->pluck('id_kosan');

        // Perawatan mendesak: prioritas high & status tertunda pada kos milik pemilik
        $perawatanMendesak = Perawatan::whereHas('kamar', function ($q) use ($kosanIds) {
            $q->whereIn('id_kosan', $kosanIds);
        })
            ->where('prioritas', 'high')
            ->where('status', 'tertunda')
            ->with('kamar.kosan')
            ->orderByDesc('id_perawatan')
            ->get()
            ->map(function ($p) {
                // Di-map alias difilter datanya, biar frontend nerima yang penting-penting aja
                return [
                    'id_perawatan' => $p->id_perawatan,
                    'nama_kos' => $p->kamar->kosan->nama_kosan ?? null,
                    'no_kamar' => $p->kamar->no_kamar ?? null,
                    'kategori' => $p->kategori,
                    'judul' => $p->judul,
                ];
            });

        return response()->json([
            'status' => true,
            'message' => 'Ringkasan dashboard.',
            'data' => [
                'total_kosan' => $kosanIds->count(), // Total properti kos yang dia punya
                'total_kamar' => Kamar::whereIn('id_kosan', $kosanIds)->count(), // Total semua kamar dari semua kos
                // Kamar kosong: status kamar aktif tapi nggak ada relasi pemesananAktif (kosong)
                'kamar_tersedia' => Kamar::whereIn('id_kosan', $kosanIds)
                    ->where('status', 'aktif')->whereDoesntHave('pemesananAktif')->count(),
                // Kamar isi: kamar yang punya relasi ke pemesananAktif
                'kamar_terisi' => Kamar::whereIn('id_kosan', $kosanIds)
                    ->whereHas('pemesananAktif')->count(),
                // Total semua transaksi pemesanan (mau yang pending, aktif, atau kelar)
                'total_pemesanan' => Pemesanan::whereHas('kamar', function ($q) use ($kosanIds) {
                    $q->whereIn('id_kosan', $kosanIds);
                })->count(),
                'perawatan_mendesak' => $perawatanMendesak,
            ],
        ]);
    }

    // Nampilin daftar kosan milik user lengkap per kos
    public function kosSaya()
    {
        $kosanList = Kosan::where('id_pengguna', auth('api')->id())
            ->with('foto')
            ->orderBy('id_kosan')
            ->get();

        $data = $kosanList->map(function ($kosan) {
            $kamar = Kamar::where('id_kosan', $kosan->id_kosan);

            $totalKamar = (clone $kamar)->count();
            $terisi = (clone $kamar)->whereHas('pemesananAktif')->count();
            $tersedia = (clone $kamar)->where('status', 'aktif')->whereDoesntHave('pemesananAktif')->count();

            // Pendapatan bulanan = total harga kamar yang sedang terisi (ada penyewa aktif)
            $pendapatan = (clone $kamar)->whereHas('pemesananAktif')->sum('harga_bulanan');

            // Persentase hunian = (terisi / total) * 100
            $persenHunian = $totalKamar > 0 ? round(($terisi / $totalKamar) * 100) : 0;

            // Perawatan pada kos ini
            $perawatan = Perawatan::whereHas('kamar', function ($q) use ($kosan) {
                $q->where('id_kosan', $kosan->id_kosan);
            });

            // Foto pertama (thumbnail diutamakan) untuk kartu Kos Saya
            $fotoUtama = $kosan->foto->firstWhere('is_thumbnail', true) ?? $kosan->foto->first();

            return [
                'id_kosan' => $kosan->id_kosan,
                'nama_kosan' => $kosan->nama_kosan,
                'alamat' => $kosan->alamat,
                'tipe_kosan' => $kosan->tipe_kosan,
                'foto' => $fotoUtama->url_foto ?? null,
                'status_kosan' => $kosan->status_kosan,
                'total_kamar' => $totalKamar,
                'kamar_terisi' => $terisi,
                'kamar_tersedia' => $tersedia,
                'pendapatan_bulanan' => (float) $pendapatan,
                'persentase_hunian' => $persenHunian,
                'perawatan_tertunda' => (clone $perawatan)->where('status', 'tertunda')->count(),
                'perawatan_mendesak' => (clone $perawatan)->where('prioritas', 'high')->where('status', 'tertunda')->count(),
            ];
        });

        return response()->json([
            'status' => true,
            'message' => 'Statistik kos saya.',
            'data' => $data,
        ]);
    }
}
