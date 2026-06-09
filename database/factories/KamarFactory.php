<?php

namespace Database\Factories;

use App\Models\Kamar;
use App\Models\Kosan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Kamar>
 */
class KamarFactory extends Factory
{
    protected $model = Kamar::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_kosan' => Kosan::factory(),
            'no_kamar' => strtoupper($this->faker->bothify('?-###')),
            'harga_bulanan' => $this->faker->numberBetween(800, 3000) * 1000,
            'status' => 'tersedia',
            'ukuran' => $this->faker->randomElement(['3x3', '3x4', '4x4']),
            'jenis_kasur' => $this->faker->randomElement(['single', 'queen', 'twin']),
        ];
    }
}
