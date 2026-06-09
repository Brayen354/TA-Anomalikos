<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Untuk request API, jangan redirect ke halaman login—biarkan
        // dilempar sebagai AuthenticationException agar menjadi JSON 401.
        $middleware->redirectGuestsTo(
            fn (Request $request) => $request->is('api/*') ? null : '/login'
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // Format seluruh error API agar konsisten: { status, message, errors? }
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validasi gagal.',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                // Pesan khusus untuk pemesanan kamar
                $message = $request->is('api/pemesanan')
                    ? 'Silakan login terlebih dahulu untuk melakukan pemesanan kamar.'
                    : 'Silakan login terlebih dahulu.';

                return response()->json([
                    'status' => false,
                    'message' => $message,
                ], 401);
            }
        });

        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Data tidak ditemukan.',
                ], 404);
            }
        });

        $exceptions->render(function (AuthorizationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'status' => false,
                    'message' => $e->getMessage() ?: 'Anda tidak memiliki akses.',
                ], 403);
            }
        });

        $exceptions->render(function (HttpExceptionInterface $e, Request $request) {
            if ($request->is('api/*')) {
                $message = $e->getMessage()
                    ?: ($e instanceof NotFoundHttpException ? 'Data tidak ditemukan.' : 'Terjadi kesalahan.');

                return response()->json([
                    'status' => false,
                    'message' => $message,
                ], $e->getStatusCode());
            }
        });
    })->create();
