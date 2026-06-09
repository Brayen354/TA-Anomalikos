<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FasilitasController;
use App\Http\Controllers\FavoritController;
use App\Http\Controllers\KamarController;
use App\Http\Controllers\KosanController;
use App\Http\Controllers\Pemilik\KamarController as PemilikKamarController;
use App\Http\Controllers\Pemilik\KosanController as PemilikKosanController;
use App\Http\Controllers\Pemilik\PemesananController as PemilikPemesananController;
use App\Http\Controllers\Pemilik\PerawatanController as PemilikPerawatanController;
use App\Http\Controllers\PemesananController;
use App\Http\Controllers\PengaturanPrivasiController;
use App\Http\Controllers\ProfilController;
use App\Http\Controllers\RiwayatDilihatController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Public endpoints (no auth required)
Route::get('kosan', [KosanController::class, 'index']);
Route::get('kosan/{id}', [KosanController::class, 'show']);
Route::get('kamar/{id}', [KamarController::class, 'show']);
Route::get('fasilitas', [FasilitasController::class, 'index']);

Route::middleware('auth:api')->group(function () {
    // Auth
    Route::get('me', [AuthController::class, 'me']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('ganti-password', [AuthController::class, 'gantiPassword']);

    // Penyewa / pengguna umum
    // Aktif / nonaktif kos (pemilik)
    Route::put('kosan/{id}/nonaktifkan', [PemilikKosanController::class, 'nonaktifkan']);
    Route::put('kosan/{id}/aktifkan', [PemilikKosanController::class, 'aktifkan']);

    // Favorit
    Route::get('favorit', [FavoritController::class, 'index']);
    Route::post('favorit', [FavoritController::class, 'store']);
    Route::delete('favorit/{id_kamar}', [FavoritController::class, 'destroy']);

    // Riwayat dilihat
    Route::get('riwayat-dilihat', [RiwayatDilihatController::class, 'index']);
    Route::post('riwayat-dilihat', [RiwayatDilihatController::class, 'store']);

    // Pemesanan (penyewa)
    Route::post('pemesanan', [PemesananController::class, 'store']);
    Route::get('riwayat-pemesanan', [PemesananController::class, 'riwayat']);

    // Profil
    Route::get('profil', [ProfilController::class, 'show']);
    Route::put('profil', [ProfilController::class, 'update']);

    // Pengaturan privasi
    Route::get('pengaturan-privasi', [PengaturanPrivasiController::class, 'show']);
    Route::put('pengaturan-privasi', [PengaturanPrivasiController::class, 'update']);

    // Chatbot AI
    Route::post('chatbot', [ChatbotController::class, 'tanya']);
    Route::delete('chatbot/clear', [ChatbotController::class, 'clear']);

    // Pemilik kos

    // Dashboard pemilik (GET /dashboard)
    Route::get('dashboard', [DashboardController::class, 'index']);

    Route::prefix('pemilik')->group(function () {
        // Statistik per kos (menu "Kos Saya")
        Route::get('kos-saya', [DashboardController::class, 'kosSaya']);

        // CRUD Kosan
        Route::get('kosan', [PemilikKosanController::class, 'index']);
        Route::post('kosan', [PemilikKosanController::class, 'store']);
        Route::get('kosan/{id}', [PemilikKosanController::class, 'show']);
        Route::put('kosan/{id}', [PemilikKosanController::class, 'update']);
        Route::delete('kosan/{id}', [PemilikKosanController::class, 'destroy']);

        // CRUD Kamar
        Route::get('kamar', [PemilikKamarController::class, 'index']);
        Route::post('kamar', [PemilikKamarController::class, 'store']);
        Route::put('kamar/{id}', [PemilikKamarController::class, 'update']);
        Route::delete('kamar/{id}', [PemilikKamarController::class, 'destroy']);

        // Permintaan pemesanan + konfirmasi / tolak
        Route::get('pemesanan', [PemilikPemesananController::class, 'index']);
        Route::put('pemesanan/{id}/konfirmasi', [PemilikPemesananController::class, 'konfirmasi']);
        Route::put('pemesanan/{id}/tolak', [PemilikPemesananController::class, 'tolak']);
        Route::put('pemesanan/{id}/batalkan', [PemilikPemesananController::class, 'batalkan']);
        Route::put('pemesanan/{id}/akhiri', [PemilikPemesananController::class, 'akhiri']);

        // CRUD Perawatan kamar
        Route::get('perawatan', [PemilikPerawatanController::class, 'index']);
        Route::post('perawatan', [PemilikPerawatanController::class, 'store']);
        Route::put('perawatan/{id}', [PemilikPerawatanController::class, 'update']);
        Route::delete('perawatan/{id}', [PemilikPerawatanController::class, 'destroy']);
    });
});
