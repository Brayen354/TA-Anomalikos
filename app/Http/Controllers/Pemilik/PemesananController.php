<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Pemesanan;
use Illuminate\Http\Request;

class PemesananController extends Controller
{
    // GET /pemilik/pemesanan - seluruh penyewa & pengajuan pada kos milik pemilik
    // Filter opsional ?status= (menunggu_konfirmasi|aktif|ditolak|dibatalkan|selesai)
    public function index(Request $request)
    {
        $query = Pemesanan::whereHas('kamar.kosan', function ($q) {
            $q->where('id_pengguna', auth('api')->id());
        })->with(['pengguna', 'kamar.kosan']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $pemesanan = $query->orderByDesc('id_pemesanan')->get();

        $data = $pemesanan->map(function ($p) {
            return [
                'id_pemesanan' => $p->id_pemesanan,
                'penyewa' => [
                    'id_pengguna' => $p->pengguna->id_pengguna ?? null,
                    'nama' => $p->pengguna->nama ?? null,
                    'no_telp' => $p->pengguna->no_telp ?? null,
                    'email' => $p->pengguna->email ?? null,
                ],
                'kamar' => [
                    'id_kamar' => $p->kamar->id_kamar ?? null,
                    'no_kamar' => $p->kamar->no_kamar ?? null,
                    'harga_bulanan' => $p->kamar->harga_bulanan ?? null,
                ],
                'kosan' => [
                    'id_kosan' => $p->kamar->kosan->id_kosan ?? null,
                    'nama_kosan' => $p->kamar->kosan->nama_kosan ?? null,
                ],
                'tanggal_pengajuan' => $p->tanggal_pengajuan,
                'tanggal_mulai' => $p->tanggal_mulai,
                'tanggal_selesai' => $p->tanggal_selesai,
                'durasi_bulan' => $p->durasi_bulan,
                'total_harga' => $p->total_harga,
                'catatan_pemilik' => $p->catatan_pemilik,
                'alasan_pembatalan' => $p->alasan_pembatalan,
                'status' => $p->status,
            ];
        });

        return response()->json([
            'status' => true,
            'message' => 'Daftar penyewa & pengajuan sewa.',
            'data' => $data,
        ]);
    }

    // Endpoint (PUT) buat nge-ACC pengajuan sewa status pemesanan menjadi "aktif"
    public function konfirmasi(Request $request, $id)
    {
        $data = $request->validate([
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after:tanggal_mulai',
            'catatan_pemilik' => 'nullable|string',
        ]);

        $pemesanan = $this->pemesananMilik($id);

        if ($pemesanan->status !== 'menunggu_konfirmasi') {
            return response()->json([
                'status' => false,
                'message' => 'Hanya pengajuan yang menunggu konfirmasi yang dapat dikonfirmasi.',
            ], 422);
        }

        $update = ['status' => 'aktif'];
        if ($request->filled('tanggal_mulai')) {
            $update['tanggal_mulai'] = $data['tanggal_mulai'];
        }
        if ($request->filled('tanggal_selesai')) {
            $update['tanggal_selesai'] = $data['tanggal_selesai'];
        }
        if ($request->filled('catatan_pemilik')) {
            $update['catatan_pemilik'] = $data['catatan_pemilik'];
        }

        $pemesanan->update($update);

        // Status kamar (terisi/tersedia) dihitung otomatis dari penyewaan aktif.
        return $this->responseDenganKamar($pemesanan, 'Pengajuan sewa dikonfirmasi. Penyewa kini aktif.');
    }

    // Endpoint (PUT) buat nolak pengajuan sewa
    public function tolak(Request $request, $id)
    {
        $data = $request->validate([
            'alasan_pembatalan' => 'nullable|string',
        ]);

        $pemesanan = $this->pemesananMilik($id);

        if ($pemesanan->status !== 'menunggu_konfirmasi') {
            return response()->json([
                'status' => false,
                'message' => 'Hanya pengajuan yang menunggu konfirmasi yang dapat ditolak.',
            ], 422);
        }

        $pemesanan->update([
            'alasan_pembatalan' => $data['alasan_pembatalan'] ?? 'Pengajuan ditolak oleh pemilik.',
            'status' => 'ditolak',
        ]);

        return $this->responseDenganKamar($pemesanan, 'Pengajuan sewa ditolak.');
    }

    // Endpoint (PUT) buat nge-cancel sewa
    public function batalkan(Request $request, $id)
    {
        $data = $request->validate([
            'alasan_pembatalan' => 'nullable|string',
        ]);

        $pemesanan = $this->pemesananMilik($id);

        if (! in_array($pemesanan->status, ['menunggu_konfirmasi', 'aktif'])) {
            return response()->json([
                'status' => false,
                'message' => 'Pemesanan ini tidak dapat dibatalkan.',
            ], 422);
        }

        $pemesanan->update([
            'alasan_pembatalan' => $data['alasan_pembatalan'] ?? 'Dibatalkan oleh pemilik.',
            'status' => 'dibatalkan',
        ]);

        return $this->responseDenganKamar($pemesanan, 'Sewa dibatalkan. Kamar kembali tersedia.');
    }

    // PUT /pemilik/pemesanan/{id}/akhiri -> status "selesai"
    public function akhiri($id)
    {
        $pemesanan = $this->pemesananMilik($id);

        if ($pemesanan->status !== 'aktif') {
            return response()->json([
                'status' => false,
                'message' => 'Hanya sewa aktif yang dapat diakhiri.',
            ], 422);
        }

        $pemesanan->update(['status' => 'selesai']);

        return $this->responseDenganKamar($pemesanan, 'Sewa telah diakhiri. Kamar kembali tersedia.');
    }

    // Ambil pemesanan yang kamarnya milik pemilik yang sedang login
    private function pemesananMilik($id)
    {
        return Pemesanan::with('kamar.kosan')
            ->whereHas('kamar.kosan', function ($q) {
                $q->where('id_pengguna', auth('api')->id());
            })
            ->findOrFail($id);
    }

    private function responseDenganKamar(Pemesanan $pemesanan, string $pesan)
    {
        return response()->json([
            'status' => true,
            'message' => $pesan,
            'data' => $pemesanan->fresh(['kamar.kosan']),
        ]);
    }
}
