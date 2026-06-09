<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatbotHistory extends Model
{
    use HasFactory;

    protected $table = 'chatbot_history';

    protected $primaryKey = 'id_chat';

    // Tabel hanya punya created_at, tidak ada updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'id_pengguna',
        'pertanyaan',
        'jawaban',
    ];

    // Relasi ke pengguna
    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna');
    }
}
