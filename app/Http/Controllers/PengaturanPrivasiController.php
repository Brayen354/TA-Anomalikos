<?php

namespace App\Http\Controllers;

use App\Models\PengaturanPrivasi;
use Illuminate\Http\Request;

class PengaturanPrivasiController extends Controller
{
    // Endpoint(Get) buat nampilin status settingan privasi user yang lagi login (toggle on/off nya)
    public function show()
    {
        $pengaturan = PengaturanPrivasi::firstOrCreate([
            'id_pengguna' => auth('api')->id(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Pengaturan privasi.',
            'data' => $pengaturan,
        ]);
    }

    // Endpoint (PUT) buat nyimpen perubahan nge-klik/nge-toggle tombol privasi 
    public function update(Request $request)
    {
        $data = $request->validate([
            'informasi_umum' => 'sometimes|boolean',
            'informasi_data_diri' => 'sometimes|boolean',
            'riwayat_aktivitas' => 'sometimes|boolean',
            'riwayat_pencarian_kos' => 'sometimes|boolean',
        ]);

        $pengaturan = PengaturanPrivasi::firstOrCreate([
            'id_pengguna' => auth('api')->id(),
        ]);
        $pengaturan->update($data);

        return response()->json([
            'status' => true,
            'message' => 'Pengaturan privasi diperbarui.',
            'data' => $pengaturan,
        ]);
    }
}
