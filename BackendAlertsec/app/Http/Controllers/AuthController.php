<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'matricule' => 'required|string',
            'password' => 'required|string',
            'code_service' => 'nullable|string',
            'device_name' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('matricule', $request->matricule)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Identifiants incorrects'
            ], 401);
        }

        if ($user->statut !== 'actif') {
            return response()->json([
                'success' => false,
                'message' => 'Compte désactivé'
            ], 403);
        }

        // Mettre à jour la dernière connexion
        $user->update(['derniere_connexion' => now()]);

        // Créer le token
        $token = $user->createToken($request->device_name ?? 'web')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'matricule' => $user->matricule,
                    'nom' => $user->nom,
                    'prenom' => $user->prenom,
                    'nom_complet' => $user->nom_complet,
                    'grade' => $user->grade,
                    'unite' => $user->unite,
                    'secteur' => $user->secteur,
                    'role' => $user->role,
                    'email' => $user->email,
                    'telephone' => $user->telephone,
                    'avatar' => $user->avatar,
                    'specialites' => $user->specialites,
                    'experience' => $user->experience,
                    'charge_travail' => $user->charge_travail,
                    'distance_max' => $user->distance_max,
                    'taux_reussite' => $user->taux_reussite,
                    'temps_moyen_intervention' => $user->temps_moyen_intervention,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'matricule' => 'required|string|unique:users',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'grade' => 'required|string|max:255',
            'unite' => 'required|string|max:255',
            'secteur' => 'required|string|max:255',
            'role' => 'required|in:admin,superviseur,agent,operateur,citoyen',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'telephone' => 'nullable|string',
            'adresse' => 'nullable|string',
            'specialites' => 'nullable|array',
            'experience' => 'nullable|integer|min:0',
            'distance_max' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'matricule' => $request->matricule,
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'grade' => $request->grade,
            'unite' => $request->unite,
            'secteur' => $request->secteur,
            'role' => $request->role,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telephone' => $request->telephone,
            'adresse' => $request->adresse,
            'specialites' => $request->specialites,
            'experience' => $request->experience,
            'distance_max' => $request->distance_max ?? 10,
        ]);

        $token = $user->createToken('registration')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur créé avec succès',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'matricule' => $user->matricule,
                    'nom' => $user->nom,
                    'prenom' => $user->prenom,
                    'nom_complet' => $user->nom_complet,
                    'grade' => $user->grade,
                    'unite' => $user->unite,
                    'secteur' => $user->secteur,
                    'role' => $user->role,
                    'email' => $user->email,
                    'telephone' => $user->telephone,
                    'avatar' => $user->avatar,
                    'specialites' => $user->specialites,
                    'experience' => $user->experience,
                    'charge_travail' => $user->charge_travail,
                    'distance_max' => $user->distance_max,
                    'taux_reussite' => $user->taux_reussite,
                    'temps_moyen_intervention' => $user->temps_moyen_intervention,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie'
        ]);
    }

    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion de tous les appareils réussie'
        ]);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'matricule' => $user->matricule,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'nom_complet' => $user->nom_complet,
                'grade' => $user->grade,
                'unite' => $user->unite,
                'secteur' => $user->secteur,
                'role' => $user->role,
                'email' => $user->email,
                'telephone' => $user->telephone,
                'adresse' => $user->adresse,
                'avatar' => $user->avatar,
                'specialites' => $user->specialites,
                'experience' => $user->experience,
                'charge_travail' => $user->charge_travail,
                'distance_max' => $user->distance_max,
                'taux_reussite' => $user->taux_reussite,
                'temps_moyen_intervention' => $user->temps_moyen_intervention,
                'derniere_connexion' => $user->derniere_connexion,
                'statut' => $user->statut,
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|string|max:255',
            'grade' => 'sometimes|string|max:255',
            'unite' => 'sometimes|string|max:255',
            'secteur' => 'sometimes|string|max:255',
            'telephone' => 'nullable|string',
            'adresse' => 'nullable|string',
            'specialites' => 'nullable|array',
            'experience' => 'nullable|integer|min:0',
            'distance_max' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only([
            'nom', 'prenom', 'grade', 'unite', 'secteur',
            'telephone', 'adresse', 'specialites', 'experience', 'distance_max'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès',
            'data' => [
                'id' => $user->id,
                'matricule' => $user->matricule,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'nom_complet' => $user->nom_complet,
                'grade' => $user->grade,
                'unite' => $user->unite,
                'secteur' => $user->secteur,
                'role' => $user->role,
                'email' => $user->email,
                'telephone' => $user->telephone,
                'adresse' => $user->adresse,
                'avatar' => $user->avatar,
                'specialites' => $user->specialites,
                'experience' => $user->experience,
                'charge_travail' => $user->charge_travail,
                'distance_max' => $user->distance_max,
                'taux_reussite' => $user->taux_reussite,
                'temps_moyen_intervention' => $user->temps_moyen_intervention,
            ]
        ]);
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mot de passe actuel incorrect'
            ], 400);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe modifié avec succès'
        ]);
    }
}







