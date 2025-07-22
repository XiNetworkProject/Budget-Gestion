#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');

function checkAssets() {
  console.log('=== VÉRIFICATION DES ASSETS ===');
  console.log('Dist path:', distPath);
  
  try {
    // Vérifier si le dossier dist existe
    if (!fs.existsSync(distPath)) {
      console.error('❌ Le dossier dist n\'existe pas !');
      console.log('💡 Solution: Exécutez "npm run build" pour créer les assets');
      return false;
    }
    
    console.log('✅ Dossier dist trouvé');
    
    // Vérifier index.html
    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      console.error('❌ index.html manquant !');
      return false;
    }
    
    console.log('✅ index.html trouvé');
    
    // Vérifier le dossier assets
    const assetsPath = path.join(distPath, 'assets');
    if (!fs.existsSync(assetsPath)) {
      console.error('❌ Dossier assets manquant !');
      return false;
    }
    
    console.log('✅ Dossier assets trouvé');
    
    // Lister les assets
    const assets = fs.readdirSync(assetsPath);
    console.log(`📁 Nombre d'assets trouvés: ${assets.length}`);
    
    // Vérifier les types de fichiers
    const cssFiles = assets.filter(file => file.endsWith('.css'));
    const jsFiles = assets.filter(file => file.endsWith('.js'));
    const otherFiles = assets.filter(file => !file.endsWith('.css') && !file.endsWith('.js'));
    
    console.log(`📄 Fichiers CSS: ${cssFiles.length}`);
    console.log(`📄 Fichiers JS: ${jsFiles.length}`);
    console.log(`📄 Autres fichiers: ${otherFiles.length}`);
    
    // Afficher quelques exemples
    if (cssFiles.length > 0) {
      console.log('📄 Exemples CSS:', cssFiles.slice(0, 3));
    }
    
    if (jsFiles.length > 0) {
      console.log('📄 Exemples JS:', jsFiles.slice(0, 3));
    }
    
    // Vérifier la taille des fichiers
    console.log('\n📊 Taille des fichiers:');
    assets.slice(0, 5).forEach(file => {
      const filePath = path.join(assetsPath, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  ${file}: ${sizeKB} KB`);
    });
    
    // Vérifier le contenu d'index.html
    console.log('\n🔍 Vérification d\'index.html:');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Vérifier les références aux assets
    const assetReferences = indexContent.match(/assets\/[^"'\s]+/g) || [];
    console.log(`📄 Références aux assets dans index.html: ${assetReferences.length}`);
    
    // Vérifier si les assets référencés existent
    const missingAssets = assetReferences.filter(ref => {
      const assetPath = path.join(distPath, ref);
      return !fs.existsSync(assetPath);
    });
    
    if (missingAssets.length > 0) {
      console.error('❌ Assets manquants référencés dans index.html:');
      missingAssets.forEach(asset => console.error(`  - ${asset}`));
    } else {
      console.log('✅ Tous les assets référencés existent');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return false;
  }
}

function suggestSolutions() {
  console.log('\n💡 Solutions possibles:');
  console.log('1. Reconstruire l\'application: npm run build');
  console.log('2. Nettoyer le cache: npm run clean');
  console.log('3. Vérifier les variables d\'environnement');
  console.log('4. Vérifier la configuration Vite');
  console.log('5. Redémarrer le serveur de production');
}

// Exécuter la vérification
const success = checkAssets();
if (!success) {
  suggestSolutions();
} 