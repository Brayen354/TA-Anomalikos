<?php

namespace App\Http\Controllers;

use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Fungsi buat daftarin user baru
    public function register(Request $request)
    {
        // Validasi Input
        // Ngecek buat data yang dikirim dari frontend 
        // pas daftar, pastiin semua sesuai aturan yang kita mau (misal email harus unik, password minimal 6 karakter, dll).
        $data = $request->validate([
            'nama'          => 'required|string|max:255',
            'email'         => ['required', 'max:255', 'unique:pengguna,email', 'regex:/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/'],
            'password'      => 'required|string|min:6',
            'alamat'        => 'nullable|string|max:255',
            'no_telp'       => ['nullable', 'regex:/^(\+62|08)[0-9]{7,13}$/'],
            'jenis_kelamin' => 'nullable|in:L,P',
            'foto_profil'   => 'nullable|string|max:255',
        ], [
            // Custom pesan error biar user tau salahnya di mana
            'email.regex'    => 'Format email tidak valid. Gunakan format: user@domain.com',
            'no_telp.regex'  => 'Nomor telepon hanya boleh angka, diawali 08 atau +62.',
        ]);

        // Simpan Data User
        // Jia validasi di atas lolos semua, datanya dimasukin ke database (tabel pengguna)
        $pengguna = Pengguna::create($data);

        // Bikin Settingan Privasi Default
        // Habis user ke-create, kita otomatis bikinin row di tabel pengaturan privasi buat user ini, diset true semua.
        $pengguna->pengaturanPrivasi()->create([
            'informasi_umum' => true,
            'informasi_data_diri' => true,
            'riwayat_aktivitas' => true,
            'riwayat_pencarian_kos' => true,
        ]);

        // Generate Token Auto Login
        // User yang baru daftar langsung kita login-in pake JWT (JSON Web Token), biar dapet tokennya.
        $token = auth('api')->login($pengguna);

        // Return Response
        return response()->json([
            'status' => true,
            'message' => 'Registrasi berhasil.',
            'data' => [
                'pengguna' => $pengguna,
                'token' => [
                    'access_token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => auth('api')->factory()->getTTL() * 60, // umur tokennya dalam detik
                ],
            ],
        ], 201);
    }

    // Fungsi buat login
    public function login(Request $request)
    {
        // Validasi inputan login, mastiin email & password diisi.
        $kredensial = $request->validate([
            'email'    => ['required', 'regex:/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/'],
            'password' => 'required|string',
        ], [
            'email.regex' => 'Format email tidak valid.',
        ]);

        // Cek Auth
        // Cek ke database, cocok apa engga kombinasi email sama passwordnya
        $token = auth('api')->attempt($kredensial);

        // Handle Gagal Login
        // Kalau nggak cocok ($token kosong), lempar error 401 (Unauthorized).
        if (! $token) {
            return response()->json([
                'status' => false,
                'message' => 'Email atau password salah.',
            ], 401);
        }

        // Kalau cocok, kasih response sukses sekalian balikin token JWT-nya.
        return response()->json([
            'status' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'pengguna' => auth('api')->user(), // Ngambil data user yang berhasil login
                'token' => [
                    'access_token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => auth('api')->factory()->getTTL() * 60,
                ],
            ],
        ]);
    }

    // Fungsi buat ngambil profil user yang lagi login (berdasarkan token yang dikirim)
    public function me()
    {
        // Langsung balikin aja data user-nya
        return response()->json([
            'status' => true,
            'message' => 'Data pengguna.',
            'data' => auth('api')->user(),
        ]);
    }

    // Fungsi buat perpanjang token JWT biar nggak perlu login ulang kalau token lama udah mau expired
    public function refresh()
    {
        // Minta token baru ke sistem JWT-nya
        $token = auth('api')->refresh();

        // Balikin token yang baru
        return response()->json([
            'status' => true,
            'message' => 'Token berhasil diperbarui.',
            'data' => [
                'token' => [
                    'access_token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => auth('api')->factory()->getTTL() * 60,
                ],
            ],
        ]);
    }

    
    // Fungsi buat ganti password user yang lagi login
    public function gantiPassword(Request $request)
    {
        // Validasi Input
        // Pastiin password baru diisi, minimal 8 karakter
        $request->validate([
            'password_lama' => 'required|string',
            'password_baru' => 'required|string|min:8|confirmed',
        ], [
            'password_baru.min' => 'Password baru minimal 8 karakter.',
            'password_baru.confirmed' => 'Konfirmasi password baru tidak sama.',
        ]);

        // Ambil data user yang lagi login saat ini
        $pengguna = auth('api')->user();

        //  Cek Password Lama
        if (! Hash::check($request->password_lama, $pengguna->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Password lama tidak sesuai.',
                'errors' => ['password_lama' => ['Password lama tidak sesuai.']],
            ], 422);
        }

        // Update Password
        $pengguna->update(['password' => $request->password_baru]);

        return response()->json([
            'status' => true,
            'message' => 'Password berhasil diubah.',
        ]);
    }

    // Fungsi buat keluar (hapus sesi token)
    public function logout()
    {
        // Invalidasi / matiin token JWT-nya biar nggak bisa dipake buat akses API lagi
        auth('api')->logout();

        return response()->json([
            'status' => true,
            'message' => 'Logout berhasil.',
        ]);
    }
}