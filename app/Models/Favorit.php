<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorit extends Model
{
    use HasFactory;

    protected $table = 'favorit';

    protected $primaryKey = 'id_favorit';

    protected $fillable = [
        'id_pengguna',
        'id_kosan',
    ];

    // Relasi ke pengguna
    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna');
    }

    // Relasi ke kosan (favorit berbasis kos)
    public function kosan()
    {
        return $this->belongsTo(Kosan::class, 'id_kosan');
    }
}
