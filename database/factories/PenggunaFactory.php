<?php

namespace Database\Factories;

use App\Models\Pengguna;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pengguna>
 */
class PenggunaFactory extends Factory
{
    protected $model = Pengguna::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => 'password',
            'alamat' => $this->faker->address(),
            'no_telp' => $this->faker->numerify('08##########'),
            'jenis_kelamin' => $this->faker->randomElement(['L', 'P']),
            'foto_profil' => null,
        ];
    }
}
