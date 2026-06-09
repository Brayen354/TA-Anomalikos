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
        Schema::create('riwayat_dilihat', function (Blueprint $table) {
            $table->id('id_riwayat');
            $table->foreignId('id_pengguna')
                ->constrained('pengguna', 'id_pengguna')
                ->cascadeOnDelete();
            $table->foreignId('id_kamar')
                ->constrained('kamar', 'id_kamar')
                ->cascadeOnDelete();
            $table->dateTime('dilihat_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_dilihat');
    }
};
