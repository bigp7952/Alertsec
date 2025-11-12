import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useApi } from '../contexts/ApiContext';
import { LoginCredentials, RegisterData } from '../services/authService';

export default function AuthTest() {
  const { login, register, logout, logoutAll, user, isAuthenticated, loading } = useApi();
  const [loginData, setLoginData] = useState<LoginCredentials>({
    matricule: '',
    password: '',
    device_name: 'AlerteSec Test',
  });
  const [registerData, setRegisterData] = useState<RegisterData>({
    matricule: '',
    nom: '',
    prenom: '',
    grade: '',
    unite: '',
    secteur: '',
    role: 'citoyen',
    email: '',
    password: '',
    password_confirmation: '',
    telephone: '',
  });

  const handleLogin = async () => {
    try {
      await login(loginData);
      Alert.alert('Succès', 'Connexion réussie !');
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur de connexion');
    }
  };

  const handleRegister = async () => {
    try {
      await register(registerData);
      Alert.alert('Succès', 'Inscription réussie !');
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur d\'inscription');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Succès', 'Déconnexion réussie !');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de déconnexion');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAll();
      Alert.alert('Succès', 'Déconnexion de tous les appareils réussie !');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de déconnexion globale');
    }
  };

  if (isAuthenticated && user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Utilisateur connecté</Text>
        <Text style={styles.userInfo}>Nom: {user.nom} {user.prenom}</Text>
        <Text style={styles.userInfo}>Matricule: {user.matricule}</Text>
        <Text style={styles.userInfo}>Rôle: {user.role}</Text>
        <Text style={styles.userInfo}>Email: {user.email}</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Déconnexion</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleLogoutAll}>
          <Text style={styles.buttonText}>Déconnexion de tous les appareils</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test d'authentification</Text>
      
      {/* Formulaire de connexion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connexion</Text>
        <TextInput
          style={styles.input}
          placeholder="Matricule"
          value={loginData.matricule}
          onChangeText={(text) => setLoginData({ ...loginData, matricule: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry
          value={loginData.password}
          onChangeText={(text) => setLoginData({ ...loginData, password: text })}
        />
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>

      {/* Formulaire d'inscription */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inscription</Text>
        <TextInput
          style={styles.input}
          placeholder="Matricule"
          value={registerData.matricule}
          onChangeText={(text) => setRegisterData({ ...registerData, matricule: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={registerData.nom}
          onChangeText={(text) => setRegisterData({ ...registerData, nom: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Prénom"
          value={registerData.prenom}
          onChangeText={(text) => setRegisterData({ ...registerData, prenom: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={registerData.email}
          onChangeText={(text) => setRegisterData({ ...registerData, email: text })}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry
          value={registerData.password}
          onChangeText={(text) => setRegisterData({ ...registerData, password: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe"
          secureTextEntry
          value={registerData.password_confirmation}
          onChangeText={(text) => setRegisterData({ ...registerData, password_confirmation: text })}
        />
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
});




