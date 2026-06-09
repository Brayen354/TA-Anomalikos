<?php

namespace App\Http\Controllers;

use App\Models\RiwayatDilihat;
use Illuminate\Http\Request;

class RiwayatDilihatController extends Controller
{
    // Endpoint (GET) buat nampilin list kamar apa aja yang pernah diklik/dilihat sama user
    public function index()
    {
        $riwayat = RiwayatDilihat::where('id_pengguna', auth('api')->id())
            ->with('kamar.kosan')
            ->orderByDesc('dilihat_at')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Daftar riwayat dilihat.',
            'data' => $riwayat,
        ]);
    }

    // Endpoint (POST) buat nyatet log pas user nge-klik masuk ke halaman detail kamar
    public function store(Request $request)
    {
        $request->validate([
            'id_kamar' => 'required|integer|exists:kamar,id_kamar',
        ]);

        $riwayat = RiwayatDilihat::create([
            'id_pengguna' => auth('api')->id(),
            'id_kamar' => $request->id_kamar,
            'dilihat_at' => now(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Riwayat dilihat dicatat.',
            'data' => $riwayat->load('kamar.kosan'),
        ], 201);
    }
}
