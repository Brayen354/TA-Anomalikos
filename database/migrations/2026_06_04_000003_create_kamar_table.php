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
        Schema::create('kamar', function (Blueprint $table) {
            $table->id('id_kamar');
            $table->foreignId('id_kosan')
                ->constrained('kosan', 'id_kosan')
                ->cascadeOnDelete();
            $table->string('no_kamar');
            $table->decimal('harga_bulanan', 12, 2);
            // status: aktif | nonaktif (dapat disewakan / tidak).
            // Ketersediaan (terisi/tersedia) dihitung otomatis dari penyewaan aktif.
            $table->string('status')->default('aktif');
            $table->string('ukuran')->nullable();
            $table->string('jenis_kasur')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kamar');
    }
};
