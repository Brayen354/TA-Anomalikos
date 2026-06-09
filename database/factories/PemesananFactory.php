<?php

namespace Database\Factories;

use App\Models\Kamar;
use App\Models\Pemesanan;
use App\Models\Pengguna;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pemesanan>
 */
class PemesananFactory extends Factory
{
    protected $model = Pemesanan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_pengguna' => Pengguna::factory(),
            'id_kamar' => Kamar::factory(),
            'tanggal_pengajuan' => now()->toDateString(),
            'durasi_bulan' => 6,
            'tanggal_mulai' => null,
            'tanggal_selesai' => null,
            'total_harga' => null,
            'catatan_pemilik' => null,
            'alasan_pembatalan' => null,
            'status' => 'menunggu_konfirmasi',
        ];
    }
}
