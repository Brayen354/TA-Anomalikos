<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\FotoKosan;
use App\Models\Kosan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class KosanController extends Controller
{
    // Endpoint (GET) buat nampilin semua daftar properti kos yang dipunyai pemilik
    public function index()
    {
        $kosan = Kosan::where('id_pengguna', auth('api')->id())
            ->with(['fasilitas', 'foto'])
            ->withCount([
                'kamar as total_kamar',
                'kamar as kamar_tersedia' => function ($q) {
                    $q->where('status', 'aktif')->whereDoesntHave('pemesananAktif');
                },
            ])
            ->orderByDesc('id_kosan')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Daftar kosan milik Anda.',
            'data' => $kosan,
        ]);
    }

    // Endpoint (GET) buat nampilin detail 1 gedung kosan beserta isi kamarnya
    public function show($id)
    {
        $kosan = Kosan::where('id_pengguna', auth('api')->id())
            ->with(['fasilitas', 'foto', 'kamar'])
            ->withCount([
                'kamar as total_kamar',
                'kamar as kamar_tersedia' => function ($q) {
                    $q->where('status', 'aktif')->whereDoesntHave('pemesananAktif');
                },
            ])
            ->find($id);

        if (! $kosan) {
            return response()->json([
                'status'  => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Detail kosan.',
            'data'    => $kosan,
        ]);
    }

    // Endpoint (POST) buat daftarin properti kosan baru
    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_kosan' => 'required|string|max:255',
            'alamat' => 'required|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'tipe_kosan' => 'required|string|max:50',
            'deskripsi' => 'nullable|string',
            'status' => 'nullable|string|max:50',
            'fasilitas' => 'nullable|array',
            'fasilitas.*' => 'integer|exists:fasilitas,id_fasilitas',
            // Minimal 3 foto wajib saat membuat properti baru
            'foto' => 'required|array|min:3',
            'foto.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120',
        ], [
            'foto.required' => 'Minimal 3 foto properti wajib diunggah.',
            'foto.min' => 'Minimal 3 foto properti wajib diunggah.',
        ]);

        $kosan = Kosan::create([
            'id_pengguna' => auth('api')->id(),
            'nama_kosan' => $data['nama_kosan'],
            'alamat' => $data['alamat'],
            'landmark' => $data['landmark'] ?? null,
            'tipe_kosan' => $data['tipe_kosan'],
            'deskripsi' => $data['deskripsi'] ?? null,
            'status' => $data['status'] ?? 'aktif',
        ]);

        if ($request->filled('fasilitas')) {
            $kosan->fasilitas()->sync($request->fasilitas);
        }

        $this->simpanFoto($kosan, $request->file('foto', []));

        return response()->json([
            'status' => true,
            'message' => 'Kosan berhasil dibuat.',
            'data' => $kosan->load(['fasilitas', 'foto']),
        ], 201);
    }

    // Endpoint (PUT/PATCH) buat ngedit info kosan
    public function update(Request $request, $id)
    {
        // Hanya kosan milik pemilik yang sedang login
        $kosan = Kosan::where('id_pengguna', auth('api')->id())->findOrFail($id);

        $data = $request->validate([
            'nama_kosan' => 'sometimes|required|string|max:255',
            'alamat' => 'sometimes|required|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'tipe_kosan' => 'sometimes|required|string|max:50',
            'deskripsi' => 'nullable|string',
            'status' => 'nullable|string|max:50',
            'fasilitas' => 'nullable|array',
            'fasilitas.*' => 'integer|exists:fasilitas,id_fasilitas',
            // Foto baru opsional saat edit
            'foto' => 'nullable|array',
            'foto.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120',
            // Id foto yang ingin dihapus
            'hapus_foto' => 'nullable|array',
            'hapus_foto.*' => 'integer',
        ]);

        $kosan->update(collect($data)->only([
            'nama_kosan', 'alamat', 'landmark', 'tipe_kosan', 'deskripsi', 'status',
        ])->toArray());

        if ($request->has('fasilitas')) {
            $kosan->fasilitas()->sync($request->fasilitas ?? []);
        }

        // Hapus foto yang diminta
        if ($request->filled('hapus_foto')) {
            $fotoHapus = FotoKosan::where('id_kosan', $kosan->id_kosan)
                ->whereIn('id_foto', $request->hapus_foto)->get();
            foreach ($fotoHapus as $f) {
                $this->hapusFile($f->url_foto);
                $f->delete();
            }
        }

        // Tambahkan foto baru (append, bukan replace)
        $this->simpanFoto($kosan, $request->file('foto', []));

        return response()->json([
            'status' => true,
            'message' => 'Kosan berhasil diperbarui.',
            'data' => $kosan->load(['fasilitas', 'foto']),
        ]);
    }

    // DELETE kosan selamanya dari sistem
    public function destroy($id)
    {
        $kosan = Kosan::where('id_pengguna', auth('api')->id())->with('foto')->findOrFail($id);

        foreach ($kosan->foto as $f) {
            $this->hapusFile($f->url_foto);
        }
        $kosan->delete();

        return response()->json([
            'status' => true,
            'message' => 'Kosan berhasil dihapus.',
        ]);
    }

    // Buat Nge-hide kosan dari aplikasi tanpa harus dihapus
    public function nonaktifkan($id)
    {
        $kosan = Kosan::where('id_pengguna', auth('api')->id())->findOrFail($id);
        $kosan->update(['status_kosan' => 'nonaktif']);

        return response()->json([
            'status' => true,
            'message' => 'Kosan berhasil dinonaktifkan.',
            'data' => $kosan,
        ]);
    }

    // Buat nampilin lagi kosan ke sistem
    public function aktifkan($id)
    {
        $kosan = Kosan::where('id_pengguna', auth('api')->id())->findOrFail($id);
        $kosan->update(['status_kosan' => 'aktif']);

        return response()->json([
            'status' => true,
            'message' => 'Kosan berhasil diaktifkan.',
            'data' => $kosan,
        ]);
    }

    // Simpan daftar file foto ke disk public + catat di tabel foto_kosan.
    private function simpanFoto(Kosan $kosan, array $files): void
    {
        $adaThumbnail = $kosan->foto()->where('is_thumbnail', true)->exists();

        foreach ($files as $file) {
            if (! $file) {
                continue;
            }
            $path = $file->store('kosan', 'public');
            FotoKosan::create([
                'id_kosan'     => $kosan->id_kosan,
                'url_foto'     => '/photos/'.$path,
                'is_thumbnail' => ! $adaThumbnail,
            ]);
            $adaThumbnail = true;
        }
    }

    // Hapus file fisik foto bila tersimpan di disk public.
    private function hapusFile(?string $url): void
    {
        if (! $url) {
            return;
        }
        // Dukung prefix lama (/storage/) maupun baru (/photos/)
        if (str_starts_with($url, '/photos/')) {
            $path = substr($url, strlen('/photos/'));
        } elseif (str_starts_with($url, '/storage/')) {
            $path = substr($url, strlen('/storage/'));
        } else {
            return;
        }
        Storage::disk('public')->delete($path);
    }
}
