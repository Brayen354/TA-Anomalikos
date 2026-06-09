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
        Schema::create('foto_kosan', function (Blueprint $table) {
            $table->id('id_foto');
            $table->foreignId('id_kosan')
                ->constrained('kosan', 'id_kosan')
                ->cascadeOnDelete();
            $table->string('url_foto');
            $table->boolean('is_thumbnail')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('foto_kosan');
    }
};
