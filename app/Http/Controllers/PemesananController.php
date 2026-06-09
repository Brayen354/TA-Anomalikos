<?php

namespace App\Http\Controllers;

use App\Models\Kamar;
use App\Models\Pemesanan;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PemesananController extends Controller
{
    // Endpoint buat nyewa/mesen kamar kos
    public function store(Request $request)
    {
        $request->validate([
            'id_kamar' => 'required|integer|exists:kamar,id_kamar',
            'durasi_bulan' => 'nullable|integer|in:1,3,6,12',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
        ]);

        $kamar = Kamar::with('kosan')->findOrFail($request->id_kamar);

        // Pemilik tidak boleh menyewa kos miliknya sendiri
        if ($kamar->kosan && (int) $kamar->kosan->id_pengguna === (int) auth('api')->id()) {
            return response()->json([
                'status' => false,
                'message' => 'Anda tidak dapat menyewa properti milik sendiri.',
            ], 422);
        }

        // Kamar/kos harus aktif untuk dapat disewa
        if ($kamar->status !== 'aktif' || ($kamar->kosan && $kamar->kosan->status_kosan !== 'aktif')) {
            return response()->json([
                'status' => false,
                'message' => 'Kamar ini sedang tidak dapat disewa.',
            ], 422);
        }

        // Validasi gender: kos putra hanya untuk L, putri hanya untuk P, campur bebas
        $tipe = strtolower($kamar->kosan->tipe_kosan ?? 'campur');
        $genderPenyewa = auth('api')->user()->jenis_kelamin;
        if (($tipe === 'putra' && $genderPenyewa !== 'L') ||
            ($tipe === 'putri' && $genderPenyewa !== 'P')) {
            return response()->json([
                'status' => false,
                'message' => 'Anda tidak memenuhi ketentuan gender untuk kos ini.',
            ], 422);
        }

        // Tolak bila kamar sudah ditempati penyewa aktif
        if ($kamar->pemesananAktif()->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'Kamar ini sudah terisi oleh penyewa lain.',
            ], 422);
        }

        // Tentukan durasi & tanggal: penyewa boleh pilih durasi ATAU isi tanggal
        if ($request->filled('durasi_bulan')) {
            $durasi = (int) $request->durasi_bulan;
            $mulai = $request->filled('tanggal_mulai')
                ? Carbon::parse($request->tanggal_mulai)
                : Carbon::today();
            $selesai = (clone $mulai)->addMonths($durasi);
        } elseif ($request->filled('tanggal_mulai') && $request->filled('tanggal_selesai')) {
            $mulai = Carbon::parse($request->tanggal_mulai);
            $selesai = Carbon::parse($request->tanggal_selesai);

            if ($selesai->lessThanOrEqualTo($mulai)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Tanggal selesai harus setelah tanggal mulai.',
                ], 422);
            }

            $durasi = max(1, $mulai->diffInMonths($selesai));
        } else {
            return response()->json([
                'status' => false,
                'message' => 'Silakan pilih durasi (1/3/6/12 bulan) atau isi tanggal mulai dan tanggal selesai.',
            ], 422);
        }

        // Total harga = harga_bulanan * durasi (hanya informasi, bayar di luar aplikasi)
        $totalHarga = $kamar->harga_bulanan * $durasi;

        // Status otomatis menunggu_konfirmasi. Status kamar TIDAK diubah.
        $pemesanan = Pemesanan::create([
            'id_pengguna' => auth('api')->id(),
            'id_kamar' => $kamar->id_kamar,
            'tanggal_pengajuan' => now(),
            'durasi_bulan' => $durasi,
            'tanggal_mulai' => $mulai->toDateString(),
            'tanggal_selesai' => $selesai->toDateString(),
            'total_harga' => $totalHarga,
            'status' => 'menunggu_konfirmasi',
        ]);

        // Data pemilik kos untuk dihubungi via WhatsApp
        $pemesanan->load('kamar.kosan.pengguna');
        $pemilik = $pemesanan->kamar->kosan->pengguna;

        return response()->json([
            'status' => true,
            'message' => 'Pemesanan berhasil dibuat',
            'data' => [
                'id_pemesanan' => $pemesanan->id_pemesanan,
                'status' => $pemesanan->status,
                'durasi_bulan' => $pemesanan->durasi_bulan,
                'tanggal_mulai' => $pemesanan->tanggal_mulai,
                'tanggal_selesai' => $pemesanan->tanggal_selesai,
                'total_harga' => $pemesanan->total_harga,
                'nama_pemilik' => $pemilik->nama,
                'no_telp' => $pemilik->no_telp,
                'link_whatsapp' => $this->linkWhatsapp($pemilik->no_telp),
            ],
        ], 201);
    }

    // Endpoint buat nampilin list riwayat kos yang pernah dipesen
    public function riwayat()
    {
        $pemesanan = Pemesanan::where('id_pengguna', auth('api')->id())
            ->with('kamar.kosan.pengguna', 'kamar.kosan.foto')
            ->orderByDesc('id_pemesanan')
            ->get();

        $data = $pemesanan->map(function ($p) {
            $kosan = $p->kamar->kosan ?? null;
            $pemilik = $kosan->pengguna ?? null;
            $fotoUtama = $kosan
                ? ($kosan->foto->firstWhere('is_thumbnail', true) ?? $kosan->foto->first())
                : null;

            return [
                'id_pemesanan' => $p->id_pemesanan,
                'id_kosan' => $kosan->id_kosan ?? null,
                'nama_kosan' => $kosan->nama_kosan ?? null,
                'alamat' => $kosan->alamat ?? null,
                'tipe_kosan' => $kosan->tipe_kosan ?? null,
                'foto' => $fotoUtama->url_foto ?? null,
                'harga_bulanan' => $p->kamar->harga_bulanan ?? null,
                'nama_kamar' => $p->kamar->no_kamar ?? null,
                'durasi_bulan' => $p->durasi_bulan,
                'total_harga' => $p->total_harga,
                'tanggal_pengajuan' => $p->tanggal_pengajuan,
                'tanggal_mulai' => $p->tanggal_mulai,
                'tanggal_selesai' => $p->tanggal_selesai,
                'status' => $p->status,
                'alasan_pembatalan' => $p->alasan_pembatalan,
                'catatan_pemilik' => $p->catatan_pemilik,
                // Kontak pemilik untuk ditampilkan di riwayat sewa
                'nama_pemilik' => $pemilik->nama ?? null,
                'no_telp_pemilik' => $pemilik->no_telp ?? null,
                'email_pemilik' => $pemilik->email ?? null,
                'link_whatsapp' => $this->linkWhatsapp($pemilik->no_telp ?? null),
            ];
        });

        return response()->json([
            'status' => true,
            'message' => 'Riwayat pemesanan.',
            'data' => $data,
        ]);
    }

    // Ubah nomor telepon menjadi link WhatsApp (format 62)
    private function linkWhatsapp($noTelp)
    {
        if (! $noTelp) {
            return null;
        }

        $nomor = preg_replace('/[^0-9]/', '', $noTelp);

        if (str_starts_with($nomor, '0')) {
            $nomor = '62'.substr($nomor, 1);
        } elseif (! str_starts_with($nomor, '62')) {
            $nomor = '62'.$nomor;
        }

        return 'https://wa.me/'.$nomor;
    }
}
