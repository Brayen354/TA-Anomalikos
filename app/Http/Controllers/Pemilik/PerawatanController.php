<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Kamar;
use App\Models\Perawatan;
use Illuminate\Http\Request;

class PerawatanController extends Controller
{
    // Endpoint (GET) buat nampilin semua daftar komplain/perawatan
    public function index(Request $request)
    {
        $query = Perawatan::whereHas('kamar.kosan', function ($q) {
            $q->where('id_pengguna', auth('api')->id());
        })->with('kamar.kosan');

        // Filter opsional berdasarkan status / prioritas
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('prioritas')) {
            $query->where('prioritas', $request->prioritas);
        }

        $perawatan = $query->orderByDesc('id_perawatan')->get();

        return response()->json([
            'status' => true,
            'message' => 'Daftar perawatan.',
            'data' => $perawatan,
        ]);
    }

    // Endpoint (POST) buat nyatet/bikin tiket laporan kalau ada kamar yang lagi perawatan
    public function store(Request $request)
    {
        $data = $request->validate([
            'id_kamar' => 'required|integer|exists:kamar,id_kamar',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'kategori' => 'required|string|max:50',
            'prioritas' => 'nullable|in:low,medium,high',
            'status' => 'nullable|in:tertunda,diproses,selesai',
            'tanggal_laporan' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
        ]);

        // Pastikan kamar milik kos pemilik yang login
        $this->pastikanKamarMilik($data['id_kamar']);

        $data['prioritas'] = $data['prioritas'] ?? 'low';
        $data['status'] = $data['status'] ?? 'tertunda';
        $data['tanggal_laporan'] = $data['tanggal_laporan'] ?? now()->toDateString();

        $perawatan = Perawatan::create($data);

        return response()->json([
            'status' => true,
            'message' => 'Laporan perawatan dibuat.',
            'data' => $perawatan->load('kamar.kosan'),
        ], 201);
    }

    // Endpoint (PUT) buat ngupdate progress perbaikan kamar
    public function update(Request $request, $id)
    {
        $perawatan = $this->perawatanMilik($id);

        $data = $request->validate([
            'judul' => 'sometimes|required|string|max:255',
            'deskripsi' => 'nullable|string',
            'kategori' => 'sometimes|required|string|max:50',
            'prioritas' => 'nullable|in:low,medium,high',
            'status' => 'nullable|in:tertunda,diproses,selesai',
            'tanggal_selesai' => 'nullable|date',
        ]);

        // Jika status selesai dan belum ada tanggal selesai, isi otomatis
        if (($data['status'] ?? null) === 'selesai' && ! $request->filled('tanggal_selesai')) {
            $data['tanggal_selesai'] = now()->toDateString();
        }

        $perawatan->update($data);

        return response()->json([
            'status' => true,
            'message' => 'Perawatan diperbarui.',
            'data' => $perawatan->load('kamar.kosan'),
        ]);
    }

    // Endpoint (DELETE) buat ngapus laporan komplain perawatan
    public function destroy($id)
    {
        $this->perawatanMilik($id)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Perawatan dihapus.',
        ]);
    }

    // Pastikan kamar milik kos pemilik yang login
    private function pastikanKamarMilik($idKamar)
    {
        return Kamar::where('id_kamar', $idKamar)
            ->whereHas('kosan', function ($q) {
                $q->where('id_pengguna', auth('api')->id());
            })
            ->firstOrFail();
    }

    // Ambil perawatan yang dipastikan milik pemilik
    private function perawatanMilik($id)
    {
        return Perawatan::where('id_perawatan', $id)
            ->whereHas('kamar.kosan', function ($q) {
                $q->where('id_pengguna', auth('api')->id());
            })
            ->firstOrFail();
    }
}
