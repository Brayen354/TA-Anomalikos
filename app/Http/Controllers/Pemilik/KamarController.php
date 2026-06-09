<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Kamar;
use App\Models\Kosan;
use Illuminate\Http\Request;

class KamarController extends Controller
{
    // Endpoint (GET) buat nampilin semua daftar kamar punya si pemilik kos
    public function index()
    {
        $kamar = Kamar::whereHas('kosan', function ($q) {
            $q->where('id_pengguna', auth('api')->id());
        })
            ->with('kosan')
            ->withCount('pemesananAktif')
            ->orderByDesc('id_kamar')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Daftar kamar milik Anda.',
            'data' => $kamar,
        ]);
    }

    // Endpoint (POST) buat nambahin data kamar baru 
    public function store(Request $request)
    {
        $data = $request->validate([
            'id_kosan' => 'required|integer|exists:kosan,id_kosan',
            'no_kamar' => 'required|string|max:50',
            'harga_bulanan' => 'required|numeric|min:0',
            'status' => 'nullable|in:aktif,nonaktif',
            'ukuran' => 'nullable|string|max:50',
            'jenis_kasur' => 'nullable|string|max:50',
        ]);

        // Pastikan kosan tujuan milik pemilik yang login
        Kosan::where('id_pengguna', auth('api')->id())->findOrFail($data['id_kosan']);

        // Status default "aktif" (dapat disewakan). Ketersediaan dihitung otomatis.
        $data['status'] = $data['status'] ?? 'aktif';

        $kamar = Kamar::create($data);

        return response()->json([
            'status' => true,
            'message' => 'Kamar berhasil dibuat.',
            'data' => $kamar->load('kosan'),
        ], 201);
    }

    // Endpoint (PUT) buat ngedit detail kamar
    public function update(Request $request, $id)
    {
        $kamar = $this->kamarMilik($id);

        $data = $request->validate([
            'id_kosan' => 'sometimes|required|integer|exists:kosan,id_kosan',
            'no_kamar' => 'sometimes|required|string|max:50',
            'harga_bulanan' => 'sometimes|required|numeric|min:0',
            'status' => 'nullable|in:aktif,nonaktif',
            'ukuran' => 'nullable|string|max:50',
            'jenis_kasur' => 'nullable|string|max:50',
        ]);

        // Jika pindah kosan, kosan baru juga harus milik pemilik
        if ($request->filled('id_kosan')) {
            Kosan::where('id_pengguna', auth('api')->id())->findOrFail($request->id_kosan);
        }

        $kamar->update($data);

        return response()->json([
            'status' => true,
            'message' => 'Kamar berhasil diperbarui.',
            'data' => $kamar->load('kosan'),
        ]);
    }

    // DELETE buat ngapus kamar
    public function destroy($id)
    {
        $this->kamarMilik($id)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Kamar berhasil dihapus.',
        ]);
    }

    // Ambil kamar yang dipastikan milik pemilik (lewat relasi kosan)
    private function kamarMilik($id)
    {
        return Kamar::where('id_kamar', $id)
            ->whereHas('kosan', function ($q) {
                $q->where('id_pengguna', auth('api')->id());
            })
            ->firstOrFail();
    }
}
