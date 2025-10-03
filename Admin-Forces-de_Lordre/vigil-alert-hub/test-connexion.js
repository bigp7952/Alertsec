// Script de test pour vérifier la connexion
console.log('🧪 Test de connexion Vigil Alert Hub');

// Identifiants de test
const testCredentials = {
  admin: {
    matricule: 'POL001',
    motDePasse: 'admin123',
    codeService: 'DEMO',
    code2FA: '123456'
  },
  superviseur: {
    matricule: 'POL002',
    motDePasse: 'super123',
    codeService: 'DEMO',
    code2FA: '123456'
  },
  agent: {
    matricule: 'POL003',
    motDePasse: 'agent123',
    codeService: 'DEMO',
    code2FA: '123456'
  },
  operateur: {
    matricule: 'OPE001',
    motDePasse: 'ope123',
    codeService: 'DEMO',
    code2FA: '123456'
  }
};

console.log('📋 Identifiants de test :');
Object.entries(testCredentials).forEach(([role, creds]) => {
  console.log(`${role.toUpperCase()}:`);
  console.log(`  Matricule: ${creds.matricule}`);
  console.log(`  Mot de passe: ${creds.motDePasse}`);
  console.log(`  Code service: ${creds.codeService}`);
  console.log(`  Code 2FA: ${creds.code2FA}`);
  console.log('');
});

console.log('🚀 Instructions de test :');
console.log('1. Ouvrir http://localhost:5173');
console.log('2. Sélectionner "Identifiants"');
console.log('3. Utiliser les identifiants ci-dessus');
console.log('4. Code 2FA: 123456');
console.log('');
console.log('✅ Si ça ne marche pas, vérifiez :');
console.log('- Serveur démarré (npm run dev)');
console.log('- Console du navigateur (F12)');
console.log('- Identifiants copiés exactement');
console.log('- Pas d\'espaces avant/après'); 