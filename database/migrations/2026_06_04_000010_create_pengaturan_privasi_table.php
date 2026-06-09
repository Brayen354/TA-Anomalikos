<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pengaturan_privasi', function (Blueprint $table) {
            $table->id('id_pengaturan');
            $table->foreignId('id_pengguna')
                ->unique()
                ->constrained('pengguna', 'id_pengguna')
                ->cascadeOnDelete();
            $table->boolean('informasi_umum')->default(true);
            $table->boolean('informasi_data_diri')->default(true);
            $table->boolean('riwayat_aktivitas')->default(true);
            $table->boolean('riwayat_pencarian_kos')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaturan_privasi');
    }
};
