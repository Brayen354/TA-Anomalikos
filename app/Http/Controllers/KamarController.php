<?php

namespace App\Http\Controllers;

use App\Models\Kamar;

class KamarController extends Controller
{
    // GET /kamar/{id}
    public function show($id)
    {
        $kamar = Kamar::with(['kosan.fasilitas', 'kosan.foto'])->findOrFail($id);

        return response()->json([
            'status' => true,
            'message' => 'Detail kamar.',
            'data' => $kamar,
        ]);
    }
}
