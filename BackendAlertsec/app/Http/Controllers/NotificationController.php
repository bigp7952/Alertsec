<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Notification::where('user_id', $user->id);

        // Filtres
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('lu')) {
            $query->where('lu', $request->boolean('lu'));
        }

        if ($request->filled('date_debut')) {
            $query->whereDate('created_at', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('created_at', '<=', $request->date_fin);
        }

        $notifications = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    public function show($id)
    {
        $notification = Notification::where('user_id', request()->user()->id)
            ->findOrFail($id);

        // Marquer comme lue si ce n'est pas déjà fait
        if (!$notification->lu) {
            $notification->marquerCommeLue();
        }

        return response()->json([
            'success' => true,
            'data' => $notification
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', request()->user()->id)
            ->findOrFail($id);

        $notification->marquerCommeLue();

        return response()->json([
            'success' => true,
            'message' => 'Notification marquée comme lue'
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        $count = Notification::where('user_id', $user->id)
            ->where('lu', false)
            ->update([
                'lu' => true,
                'date_lecture' => now()
            ]);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications marquées comme lues"
        ]);
    }

    public function getUnreadCount(Request $request)
    {
        $user = $request->user();

        $count = Notification::where('user_id', $user->id)
            ->where('lu', false)
            ->count();

        return response()->json([
            'success' => true,
            'data' => ['unread_count' => $count]
        ]);
    }

    public function getRecent(Request $request)
    {
        $user = $request->user();
        $limit = $request->get('limit', 10);

        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    public function delete($id)
    {
        $notification = Notification::where('user_id', request()->user()->id)
            ->findOrFail($id);

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification supprimée'
        ]);
    }

    public function deleteAll(Request $request)
    {
        $user = $request->user();
        $type = $request->get('type'); // 'all', 'read', 'unread'

        $query = Notification::where('user_id', $user->id);

        switch ($type) {
            case 'read':
                $query->where('lu', true);
                break;
            case 'unread':
                $query->where('lu', false);
                break;
            // 'all' ou pas de type = supprimer toutes
        }

        $count = $query->count();
        $query->delete();

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications supprimées"
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        // Seuls admin et superviseurs peuvent créer des notifications
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à créer des notifications'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'titre' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'type' => 'required|in:info,warning,error,success',
            'action_url' => 'nullable|string|max:255',
            'donnees' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $notifications = [];

        foreach ($request->user_ids as $userId) {
            $notification = Notification::create([
                'user_id' => $userId,
                'titre' => $request->titre,
                'message' => $request->message,
                'type' => $request->type,
                'action_url' => $request->action_url,
                'donnees' => $request->donnees,
            ]);

            $notifications[] = $notification;
        }

        return response()->json([
            'success' => true,
            'message' => count($notifications) . ' notifications créées',
            'data' => $notifications
        ], 201);
    }

    public function broadcast(Request $request)
    {
        $user = $request->user();

        // Seuls admin peuvent faire des diffusions
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à faire des diffusions'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'titre' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'type' => 'required|in:info,warning,error,success',
            'roles' => 'required|array',
            'roles.*' => 'in:admin,superviseur,agent,operateur,citoyen',
            'action_url' => 'nullable|string|max:255',
            'donnees' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $users = User::whereIn('role', $request->roles)
            ->where('statut', 'actif')
            ->get();

        $notifications = [];

        foreach ($users as $targetUser) {
            $notification = Notification::create([
                'user_id' => $targetUser->id,
                'titre' => $request->titre,
                'message' => $request->message,
                'type' => $request->type,
                'action_url' => $request->action_url,
                'donnees' => $request->donnees,
            ]);

            $notifications[] = $notification;
        }

        return response()->json([
            'success' => true,
            'message' => count($notifications) . ' notifications diffusées',
            'data' => [
                'notifications_crees' => count($notifications),
                'utilisateurs_cibles' => $users->count(),
                'roles_cibles' => $request->roles
            ]
        ], 201);
    }

    public function getStats(Request $request)
    {
        $user = $request->user();

        $stats = [
            'total' => Notification::where('user_id', $user->id)->count(),
            'non_lues' => Notification::where('user_id', $user->id)->where('lu', false)->count(),
            'lues' => Notification::where('user_id', $user->id)->where('lu', true)->count(),
            'par_type' => Notification::where('user_id', $user->id)
                ->groupBy('type')
                ->selectRaw('type, count(*) as count')
                ->get()
                ->pluck('count', 'type'),
            'derniere_activite' => Notification::where('user_id', $user->id)
                ->latest()
                ->first()
                ?->created_at,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}





