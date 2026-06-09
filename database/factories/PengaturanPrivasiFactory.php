<?php

namespace Database\Factories;

use App\Models\PengaturanPrivasi;
use App\Models\Pengguna;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PengaturanPrivasi>
 */
class PengaturanPrivasiFactory extends Factory
{
    protected $model = PengaturanPrivasi::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_pengguna' => Pengguna::factory(),
            'informasi_umum' => true,
            'informasi_data_diri' => true,
            'riwayat_aktivitas' => true,
            'riwayat_pencarian_kos' => true,
        ];
    }
}
