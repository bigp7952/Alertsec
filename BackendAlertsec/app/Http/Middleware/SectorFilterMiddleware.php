<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SectorFilterMiddleware
{
    /**
     * Handle an incoming request.
     * Filtre automatiquement les données par secteur pour les superviseurs
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Si l'utilisateur est admin, pas de filtrage
        if ($user && $user->role === 'admin') {
            return $next($request);
        }
        
        // Si l'utilisateur est superviseur, ajouter le filtre par secteur
        if ($user && $user->role === 'superviseur') {
            $request->merge(['secteur_filter' => $user->secteur]);
        }
        
        return $next($request);
    }
}



