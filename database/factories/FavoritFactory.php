<?php

namespace Database\Factories;

use App\Models\Favorit;
use App\Models\Kamar;
use App\Models\Pengguna;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Favorit>
 */
class FavoritFactory extends Factory
{
    protected $model = Favorit::class;

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
        ];
    }
}
