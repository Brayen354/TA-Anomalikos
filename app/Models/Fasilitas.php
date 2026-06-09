<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fasilitas extends Model
{
    use HasFactory;

    protected $table = 'fasilitas';

    protected $primaryKey = 'id_fasilitas';

    protected $fillable = [
        'nama_fasilitas',
    ];

    // Relasi ke kosan (many to many)
    public function kosan()
    {
        return $this->belongsToMany(Kosan::class, 'kosan_fasilitas', 'id_fasilitas', 'id_kosan');
    }
}
