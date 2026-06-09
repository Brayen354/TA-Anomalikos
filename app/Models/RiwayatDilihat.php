<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RiwayatDilihat extends Model
{
    use HasFactory;

    protected $table = 'riwayat_dilihat';

    protected $primaryKey = 'id_riwayat';

    protected $fillable = [
        'id_pengguna',
        'id_kamar',
        'dilihat_at',
    ];

    protected $casts = [
        'dilihat_at' => 'datetime',
    ];

    // Relasi ke pengguna
    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna');
    }

    // Relasi ke kamar
    public function kamar()
    {
        return $this->belongsTo(Kamar::class, 'id_kamar');
    }
}
