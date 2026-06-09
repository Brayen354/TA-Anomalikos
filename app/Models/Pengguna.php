<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Pengguna extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $table = 'pengguna';

    protected $primaryKey = 'id_pengguna';

    protected $fillable = [
        'nama',
        'email',
        'password',
        'alamat',
        'no_telp',
        'jenis_kelamin',
        'foto_profil',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];

    // Identifier untuk JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    // Custom claims untuk JWT
    public function getJWTCustomClaims()
    {
        return [];
    }

    // Relasi ke kosan milik pengguna
    public function kosan()
    {
        return $this->hasMany(Kosan::class, 'id_pengguna');
    }

    // Relasi ke favorit
    public function favorit()
    {
        return $this->hasMany(Favorit::class, 'id_pengguna');
    }

    // Relasi ke riwayat dilihat
    public function riwayatDilihat()
    {
        return $this->hasMany(RiwayatDilihat::class, 'id_pengguna');
    }

    // Relasi ke pemesanan
    public function pemesanan()
    {
        return $this->hasMany(Pemesanan::class, 'id_pengguna');
    }

    // Relasi ke pengaturan privasi
    public function pengaturanPrivasi()
    {
        return $this->hasOne(PengaturanPrivasi::class, 'id_pengguna');
    }
}
