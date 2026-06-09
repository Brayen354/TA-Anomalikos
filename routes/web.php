<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// endpoint untuk akses file foto kos yang tersimpan di storage
Route::get('/photos/{path}', function (string $path) {
    $normalized = str_replace('..', '', $path);
    $normalized = ltrim($normalized, '/');

    if (! Storage::disk('public')->exists($normalized)) {
        abort(404, 'Foto tidak ditemukan.');
    }

    $full     = Storage::disk('public')->path($normalized);
    $mime     = mime_content_type($full) ?: 'application/octet-stream';

    return response()->file($full, ['Content-Type' => $mime]);
})->where('path', '.+');
