<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kamar extends Model
{
    use HasFactory;

    protected $table = 'kamar';

    protected $primaryKey = 'id_kamar';

    protected $fillable = [
        'id_kosan',
        'no_kamar',
        'harga_bulanan',
        'status',
        'ukuran',
        'jenis_kasur',
    ];

    protected $casts = [
        'harga_bulanan' => 'decimal:2',
    ];

    // ketersediaan dihitung otomatis (lihat getKetersediaanAttribute)
    protected $appends = ['ketersediaan'];

    // Relasi ke kosan
    public function kosan()
    {
        return $this->belongsTo(Kosan::class, 'id_kosan');
    }

    // Pemesanan yang sedang aktif (penyewa menempati kamar)
    public function pemesananAktif()
    {
        return $this->hasMany(Pemesanan::class, 'id_kamar')->where('status', 'aktif');
    }

    // Buat logic ketersediaan kamar yang pinter dan hemat nembak database
    public function getKetersediaanAttribute(): string
    {
        $jumlahAktif = $this->attributes['pemesanan_aktif_count']
            ?? ($this->relationLoaded('pemesananAktif')
                ? $this->pemesananAktif->count()
                : $this->pemesananAktif()->count());

        return $jumlahAktif > 0 ? 'terisi' : 'tersedia';
    }

    // Relasi ke riwayat dilihat
    public function riwayatDilihat()
    {
        return $this->hasMany(RiwayatDilihat::class, 'id_kamar');
    }

    // Relasi ke pemesanan
    public function pemesanan()
    {
        return $this->hasMany(Pemesanan::class, 'id_kamar');
    }

    // Relasi ke perawatan
    public function perawatan()
    {
        return $this->hasMany(Perawatan::class, 'id_kamar');
    }
}
