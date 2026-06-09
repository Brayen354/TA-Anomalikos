<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pemesanan extends Model
{
    use HasFactory;

    protected $table = 'pemesanan';

    protected $primaryKey = 'id_pemesanan';

    protected $fillable = [
        'id_pengguna',
        'id_kamar',
        'tanggal_pengajuan',
        'durasi_bulan',
        'tanggal_mulai',
        'tanggal_selesai',
        'total_harga',
        'catatan_pemilik',
        'alasan_pembatalan',
        'status',
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'date',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'durasi_bulan' => 'integer',
        'total_harga' => 'decimal:2',
    ];

    // Relasi ke pengguna (penyewa)
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
