<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kosan extends Model
{
    use HasFactory;

    protected $table = 'kosan';

    protected $primaryKey = 'id_kosan';

    protected $fillable = [
        'id_pengguna',
        'nama_kosan',
        'alamat',
        'landmark',
        'tipe_kosan',
        'deskripsi',
        'status',
        'status_kosan',
    ];

    // Relasi ke pemilik kos
    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna');
    }

    // Relasi ke kamar
    public function kamar()
    {
        return $this->hasMany(Kamar::class, 'id_kosan');
    }

    // Relasi ke foto kosan
    public function foto()
    {
        return $this->hasMany(FotoKosan::class, 'id_kosan');
    }

    // Relasi ke fasilitas (many to many)
    public function fasilitas()
    {
        return $this->belongsToMany(Fasilitas::class, 'kosan_fasilitas', 'id_kosan', 'id_fasilitas');
    }

    // Relasi ke favorit (berbasis kos)
    public function favorit()
    {
        return $this->hasMany(Favorit::class, 'id_kosan');
    }
}
