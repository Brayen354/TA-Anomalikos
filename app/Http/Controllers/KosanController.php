<?php

namespace App\Http\Controllers;

use App\Models\Favorit;
use App\Models\Kamar;
use App\Models\Kosan;
use Illuminate\Http\Request;

class KosanController extends Controller
{
    // Endpoint utama buat nampilin katalog/daftar kosan di halaman utama atau halaman pencarian.
    public function index(Request $request)
    {
        $query = Kosan::with(['fasilitas', 'foto'])
            // Hanya tampilkan kos yang aktif & sudah memiliki minimal 1 kamar
            ->where('status_kosan', 'aktif')
            ->whereHas('kamar')
            ->withCount([
                'kamar as total_kamar',
                // kamar_tersedia: kamar aktif yang tidak sedang ditempati penyewa
                'kamar as kamar_tersedia' => function ($q) {
                    $q->where('status', 'aktif')->whereDoesntHave('pemesananAktif');
                },
            ]);

        // harga_min = harga termurah dari kamar yang punya harga valid
        $this->withHargaMin($query);
        // is_favorit untuk pengguna yang login (endpoint publik, token opsional)
        $this->withIsFavorit($query);

        // Filter pencarian teks
        if ($request->filled('q')) {
            $cari = $request->q;
            $query->where(function ($w) use ($cari) {
                $w->where('nama_kosan', 'like', "%{$cari}%")
                    ->orWhere('alamat', 'like', "%{$cari}%")
                    ->orWhere('landmark', 'like', "%{$cari}%");
            });
        }

        // Filter tipe kos
        if ($request->filled('tipe_kosan')) {
            $query->where('tipe_kosan', $request->tipe_kosan);
        }

        // Filter rentang harga (berdasarkan harga kamar)
        if ($request->filled('harga_min') || $request->filled('harga_max')) {
            $query->whereHas('kamar', function ($k) use ($request) {
                if ($request->filled('harga_min')) {
                    $k->where('harga_bulanan', '>=', $request->harga_min);
                }
                if ($request->filled('harga_max')) {
                    $k->where('harga_bulanan', '<=', $request->harga_max);
                }
            });
        }

        // Filter fasilitas (harus punya semua fasilitas yang dipilih)
        if ($request->filled('fasilitas') && is_array($request->fasilitas)) {
            foreach ($request->fasilitas as $idFasilitas) {
                $query->whereHas('fasilitas', function ($f) use ($idFasilitas) {
                    $f->where('fasilitas.id_fasilitas', $idFasilitas);
                });
            }
        }

        $kosan = $query->orderByDesc('id_kosan')->paginate(10);

        return response()->json([
            'status' => true,
            'message' => 'Daftar kosan.',
            'data' => $kosan,
        ]);
    }

    // Buat nampilin halaman detail satu kosan beserta isi kamarnya.
    public function show($id)
    {
        $query = Kosan::with(['pengguna', 'fasilitas', 'foto', 'kamar' => function ($k) {
            // sertakan jumlah pemesanan aktif agar ketersediaan tiap kamar hemat query
            $k->withCount('pemesananAktif');
        }])
            ->withCount([
                'kamar as total_kamar',
                'kamar as kamar_tersedia' => function ($q) {
                    $q->where('status', 'aktif')->whereDoesntHave('pemesananAktif');
                },
            ]);

        $this->withHargaMin($query);
        $this->withIsFavorit($query);

        $kosan = $query->findOrFail($id);

        return response()->json([
            'status' => true,
            'message' => 'Detail kosan.',
            'data' => $kosan,
        ]);
    }

    // Subquery harga termurah dari kamar yang memiliki harga valid (> 0).
    private function withHargaMin($query): void
    {
        $query->addSelect(['harga_min' => Kamar::query()
            ->selectRaw('MIN(harga_bulanan)')
            ->whereColumn('kamar.id_kosan', 'kosan.id_kosan')
            ->where('harga_bulanan', '>', 0)]);
    }

    // Tandai apakah kos sudah difavoritkan oleh pengguna yang sedang login.
    private function withIsFavorit($query): void
    {
        $idPengguna = auth('api')->id();
        if (! $idPengguna) {
            return;
        }
        $query->addSelect(['is_favorit' => Favorit::query()
            ->selectRaw('1')
            ->whereColumn('favorit.id_kosan', 'kosan.id_kosan')
            ->where('favorit.id_pengguna', $idPengguna)
            ->limit(1)]);
    }
}
