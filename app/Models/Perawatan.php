<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Perawatan extends Model
{
    use HasFactory;

    protected $table = 'perawatan';

    protected $primaryKey = 'id_perawatan';

    protected $fillable = [
        'id_kamar',
        'judul',
        'deskripsi',
        'kategori',
        'prioritas',
        'status',
        'tanggal_laporan',
        'tanggal_selesai',
    ];

    protected $casts = [
        'tanggal_laporan' => 'date',
        'tanggal_selesai' => 'date',
    ];

    // Relasi ke kamar
    public function kamar()
    {
        return $this->belongsTo(Kamar::class, 'id_kamar');
    }
}
