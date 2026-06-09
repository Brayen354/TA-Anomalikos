<?php

namespace Database\Factories;

use App\Models\Kamar;
use App\Models\Perawatan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Perawatan>
 */
class PerawatanFactory extends Factory
{
    protected $model = Perawatan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_kamar' => Kamar::factory(),
            'judul' => $this->faker->sentence(3),
            'deskripsi' => $this->faker->sentence(8),
            'kategori' => $this->faker->randomElement(['AC', 'Listrik', 'Kamar Mandi', 'Kasur', 'Pintu', 'Jendela', 'Internet', 'Cat Dinding', 'Lainnya']),
            'prioritas' => $this->faker->randomElement(['low', 'medium', 'high']),
            'status' => $this->faker->randomElement(['tertunda', 'diproses', 'selesai']),
            'tanggal_laporan' => $this->faker->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
            'tanggal_selesai' => null,
        ];
    }
}
