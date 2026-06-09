<?php

namespace App\Http\Controllers;

use App\Models\Favorit;
use App\Models\Kamar;
use App\Models\Kosan;
use Illuminate\Http\Request;

class FavoritController extends Controller
{
    // Endpoint buat nampilin semua daftar kosan yang di Favorit
    public function index()
    {
        $idPengguna = auth('api')->id();

        $kosan = Kosan::whereHas('favorit', function ($q) use ($idPengguna) {
            $q->where('id_pengguna', $idPengguna);
        })
            ->with(['fasilitas', 'foto'])
            ->withCount([
                'kamar as total_kamar',
                'kamar as kamar_tersedia' => function ($q) {
                    $q->where('status', 'aktif')->whereDoesntHave('pemesananAktif');
                },
            ])
            ->addSelect(['harga_min' => Kamar::query()
                ->selectRaw('MIN(harga_bulanan)')
                ->whereColumn('kamar.id_kosan', 'kosan.id_kosan')
                ->where('harga_bulanan', '>', 0)])
            ->orderByDesc('id_kosan')
            ->get();

        // Semua item di sini sudah pasti favorit
        $kosan->each(fn ($k) => $k->setAttribute('is_favorit', true));

        return response()->json([
            'status' => true,
            'message' => 'Daftar favorit.',
            'data' => $kosan,
        ]);
    }

    // Buat masukin kosan ke daftar favorit user
    public function store(Request $request)
    {
        $request->validate([
            'id_kosan' => 'required|integer|exists:kosan,id_kosan',
        ]);

        $favorit = Favorit::firstOrCreate([
            'id_pengguna' => auth('api')->id(),
            'id_kosan' => $request->id_kosan,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Kos ditambahkan ke favorit.',
            'data' => $favorit,
        ], 201);
    }

    // Buat nge un favorite atau ngapus kosan dari daftar wishlist
    public function destroy($id_kosan)
    {
        Favorit::where('id_pengguna', auth('api')->id())
            ->where('id_kosan', $id_kosan)
            ->delete();

        return response()->json([
            'status' => true,
            'message' => 'Kos dihapus dari favorit.',
        ]);
    }
}
