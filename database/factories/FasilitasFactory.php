<?php

namespace Database\Factories;

use App\Models\Fasilitas;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Fasilitas>
 */
class FasilitasFactory extends Factory
{
    protected $model = Fasilitas::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama_fasilitas' => ucfirst($this->faker->unique()->word()),
        ];
    }
}
