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
        Schema::create('pemesanan', function (Blueprint $table) {
            $table->id('id_pemesanan');
            $table->foreignId('id_pengguna')
                ->constrained('pengguna', 'id_pengguna')
                ->cascadeOnDelete();
            $table->foreignId('id_kamar')
                ->constrained('kamar', 'id_kamar')
                ->cascadeOnDelete();
            $table->date('tanggal_pengajuan');
            $table->integer('durasi_bulan')->nullable();
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_selesai')->nullable();
            $table->decimal('total_harga', 14, 2)->nullable();
            $table->text('catatan_pemilik')->nullable();
            $table->text('alasan_pembatalan')->nullable();
            // status: menunggu_konfirmasi | aktif | ditolak | dibatalkan | selesai
            $table->string('status')->default('menunggu_konfirmasi');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemesanan');
    }
};
