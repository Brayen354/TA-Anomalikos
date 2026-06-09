<?php

namespace Database\Factories;

use App\Models\FotoKosan;
use App\Models\Kosan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FotoKosan>
 */
class FotoKosanFactory extends Factory
{
    protected $model = FotoKosan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_kosan' => Kosan::factory(),
            'url_foto' => 'https://picsum.photos/seed/'.$this->faker->uuid().'/640/480',
            'is_thumbnail' => false,
        ];
    }
}
