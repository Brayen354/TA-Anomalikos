<?php

namespace App\Http\Controllers;

use App\Models\Fasilitas;

class FasilitasController extends Controller
{
    // Endpoint buat ngambil semua daftar master fasilitas
    public function index()
    {
        $fasilitas = Fasilitas::orderBy('nama_fasilitas')->get();

        return response()->json([
            'status' => true,
            'message' => 'Daftar fasilitas.',
            'data' => $fasilitas,
        ]);
    }
}
