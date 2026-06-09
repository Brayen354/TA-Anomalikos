<?php

namespace Database\Factories;

use App\Models\Kosan;
use App\Models\Pengguna;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Kosan>
 */
class KosanFactory extends Factory
{
    protected $model = Kosan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_pengguna' => Pengguna::factory(),
            'nama_kosan' => 'Kost '.$this->faker->lastName(),
            'alamat' => $this->faker->address(),
            'landmark' => 'Dekat '.$this->faker->company(),
            'tipe_kosan' => $this->faker->randomElement(['putra', 'putri', 'campur']),
            'deskripsi' => $this->faker->paragraph(),
            'status' => 'aktif',
        ];
    }
}
