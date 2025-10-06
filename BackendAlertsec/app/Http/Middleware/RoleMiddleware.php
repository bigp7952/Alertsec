<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié'
            ], 401);
        }

        $userRole = $request->user()->role;
        $allowedRoles = explode('|', $roles);

        if (!in_array($userRole, $allowedRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé. Rôles requis: ' . implode(', ', $allowedRoles)
            ], 403);
        }

        return $next($request);
    }
}





