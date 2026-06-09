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
        Schema::create('favorit', function (Blueprint $table) {
            $table->id('id_favorit');
            $table->foreignId('id_pengguna')
                ->constrained('pengguna', 'id_pengguna')
                ->cascadeOnDelete();
            // Favorit berbasis kos (bukan kamar)
            $table->foreignId('id_kosan')
                ->constrained('kosan', 'id_kosan')
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['id_pengguna', 'id_kosan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorit');
    }
};
