<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengaturanPrivasi extends Model
{
    use HasFactory;

    protected $table = 'pengaturan_privasi';

    protected $primaryKey = 'id_pengaturan';

    protected $fillable = [
        'id_pengguna',
        'informasi_umum',
        'informasi_data_diri',
        'riwayat_aktivitas',
        'riwayat_pencarian_kos',
    ];

    protected $casts = [
        'informasi_umum' => 'boolean',
        'informasi_data_diri' => 'boolean',
        'riwayat_aktivitas' => 'boolean',
        'riwayat_pencarian_kos' => 'boolean',
    ];

    // Relasi ke pengguna
    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna');
    }
}
