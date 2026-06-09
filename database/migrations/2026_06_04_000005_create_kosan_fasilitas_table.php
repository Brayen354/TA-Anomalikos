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
        Schema::create('kosan_fasilitas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_kosan')
                ->constrained('kosan', 'id_kosan')
                ->cascadeOnDelete();
            $table->foreignId('id_fasilitas')
                ->constrained('fasilitas', 'id_fasilitas')
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['id_kosan', 'id_fasilitas']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kosan_fasilitas');
    }
};
