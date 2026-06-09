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
        Schema::create('chatbot_history', function (Blueprint $table) {
            $table->id('id_chat');
            $table->foreignId('id_pengguna')
                ->constrained('pengguna', 'id_pengguna')
                ->cascadeOnDelete();
            $table->text('pertanyaan');
            $table->text('jawaban');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chatbot_history');
    }
};
