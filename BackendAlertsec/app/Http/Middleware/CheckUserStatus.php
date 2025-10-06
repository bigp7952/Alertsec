<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->statut !== 'actif') {
            return response()->json([
                'success' => false,
                'message' => 'Compte désactivé. Contactez votre administrateur.'
            ], 403);
        }

        return $next($request);
    }
}





