<?php

namespace Database\Factories;

use App\Models\Kamar;
use App\Models\Pengguna;
use App\Models\RiwayatDilihat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RiwayatDilihat>
 */
class RiwayatDilihatFactory extends Factory
{
    protected $model = RiwayatDilihat::class;

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
            'dilihat_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
