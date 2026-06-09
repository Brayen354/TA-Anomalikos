<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FotoKosan extends Model
{
    use HasFactory;

    protected $table = 'foto_kosan';

    protected $primaryKey = 'id_foto';

    protected $fillable = [
        'id_kosan',
        'url_foto',
        'is_thumbnail',
    ];

    protected $casts = [
        'is_thumbnail' => 'boolean',
    ];

    // Relasi ke kosan
    public function kosan()
    {
        return $this->belongsTo(Kosan::class, 'id_kosan');
    }
}
