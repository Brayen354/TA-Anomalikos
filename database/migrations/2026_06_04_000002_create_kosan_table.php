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
        Schema::create('kosan', function (Blueprint $table) {
            $table->id('id_kosan');
            $table->foreignId('id_pengguna')
                ->constrained('pengguna', 'id_pengguna')
                ->cascadeOnDelete();
            $table->string('nama_kosan');
            $table->string('alamat');
            $table->string('landmark')->nullable();
            $table->string('tipe_kosan');
            $table->text('deskripsi')->nullable();
            $table->string('status')->default('aktif');
            // status_kosan: aktif | nonaktif (untuk menonaktifkan kos dari pencarian)
            $table->string('status_kosan')->default('aktif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kosan');
    }
};
