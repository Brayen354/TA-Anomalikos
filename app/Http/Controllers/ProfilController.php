<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfilController extends Controller
{
    // Endpoint (GET) buat narik data profil user yang lagi login buat ditampilin di halaman "My Profile"
    public function show()
    {
        $pengguna = auth('api')->user()->load('pengaturanPrivasi');

        return response()->json([
            'status' => true,
            'message' => 'Profil pengguna.',
            'data' => $pengguna,
        ]);
    }

    // Endpoint (PUT) buat nge-save perubahan kalau user ngedit nama, email, nomor HP, atau foto profilnya
    public function update(Request $request)
    {
        $pengguna = auth('api')->user();

        $data = $request->validate([
            'nama'  => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes', 'required', 'max:255',
                'regex:/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/',
                Rule::unique('pengguna', 'email')->ignore($pengguna->id_pengguna, 'id_pengguna'),
            ],
            'alamat'        => 'nullable|string|max:255',
            'no_telp'       => ['nullable', 'regex:/^(\+62|08)[0-9]{7,13}$/'],
            'jenis_kelamin' => 'nullable|in:L,P',
            'foto_profil'   => 'nullable|string|max:255',
        ], [
            'email.regex'   => 'Format email tidak valid. Gunakan format: user@domain.com',
            'no_telp.regex' => 'Nomor telepon hanya boleh angka, diawali 08 atau +62.',
        ]);

        $pengguna->update($data);

        return response()->json([
            'status' => true,
            'message' => 'Profil diperbarui.',
            'data' => $pengguna->load('pengaturanPrivasi'),
        ]);
    }
}
