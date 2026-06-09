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
        Schema::create('perawatan', function (Blueprint $table) {
            $table->id('id_perawatan');
            $table->foreignId('id_kamar')
                ->constrained('kamar', 'id_kamar')
                ->cascadeOnDelete();
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            // kategori: AC, Listrik, Kamar Mandi, Kasur, Pintu, Jendela, Internet, Cat Dinding, Lainnya
            $table->string('kategori');
            // prioritas: low | medium | high
            $table->string('prioritas')->default('low');
            // status: tertunda | diproses | selesai
            $table->string('status')->default('tertunda');
            $table->date('tanggal_laporan');
            $table->date('tanggal_selesai')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perawatan');
    }
};
