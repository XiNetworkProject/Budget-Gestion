#!/usr/bin/env node

/**
 * Script de test de performance pour Budget Gestion
 * Usage: npm run performance:test
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Démarrage des tests de performance...\n');

// Configuration des tests
const TEST_CONFIG = {
  buildTimeout: 120000, // 2 minutes
  lighthouseTimeout: 60000, // 1 minute
  performanceThreshold: {
    firstContentfulPaint: 2000, // 2s
    largestContentfulPaint: 4000, // 4s
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100 // 100ms
  }
};

// Fonction pour exécuter une commande avec timeout
function execWithTimeout(command, timeout = 30000) {
  try {
    return execSync(command, { 
      timeout, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Fonction pour analyser les métriques Lighthouse
function analyzeLighthouseMetrics(reportPath) {
  try {
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    const metrics = report.audits;
    
    const results = {
      firstContentfulPaint: metrics['first-contentful-paint']?.numericValue || 0,
      largestContentfulPaint: metrics['largest-contentful-paint']?.numericValue || 0,
      cumulativeLayoutShift: metrics['cumulative-layout-shift']?.numericValue || 0,
      firstInputDelay: metrics['max-potential-fid']?.numericValue || 0,
      totalBlockingTime: metrics['total-blocking-time']?.numericValue || 0,
      speedIndex: metrics['speed-index']?.numericValue || 0,
      performanceScore: metrics['performance']?.score * 100 || 0
    };
    
    return results;
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse des métriques Lighthouse:', error.message);
    return null;
  }
}

// Fonction pour vérifier les seuils de performance
function checkPerformanceThresholds(metrics) {
  const issues = [];
  
  if (metrics.firstContentfulPaint > TEST_CONFIG.performanceThreshold.firstContentfulPaint) {
    issues.push(`FCP trop lent: ${metrics.firstContentfulPaint}ms (seuil: ${TEST_CONFIG.performanceThreshold.firstContentfulPaint}ms)`);
  }
  
  if (metrics.largestContentfulPaint > TEST_CONFIG.performanceThreshold.largestContentfulPaint) {
    issues.push(`LCP trop lent: ${metrics.largestContentfulPaint}ms (seuil: ${TEST_CONFIG.performanceThreshold.largestContentfulPaint}ms)`);
  }
  
  if (metrics.cumulativeLayoutShift > TEST_CONFIG.performanceThreshold.cumulativeLayoutShift) {
    issues.push(`CLS trop élevé: ${metrics.cumulativeLayoutShift} (seuil: ${TEST_CONFIG.performanceThreshold.cumulativeLayoutShift})`);
  }
  
  if (metrics.firstInputDelay > TEST_CONFIG.performanceThreshold.firstInputDelay) {
    issues.push(`FID trop lent: ${metrics.firstInputDelay}ms (seuil: ${TEST_CONFIG.performanceThreshold.firstInputDelay}ms)`);
  }
  
  return issues;
}

// Fonction pour générer un rapport
function generateReport(metrics, issues, buildTime) {
  const report = {
    timestamp: new Date().toISOString(),
    buildTime: buildTime,
    metrics: metrics,
    issues: issues,
    passed: issues.length === 0,
    summary: {
      performanceScore: metrics.performanceScore,
      totalIssues: issues.length,
      buildTimeSeconds: buildTime / 1000
    }
  };
  
  const reportPath = join(process.cwd(), 'performance-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

// Fonction principale de test
async function runPerformanceTests() {
  console.log('📦 Étape 1: Build de l\'application...');
  const buildStart = Date.now();
  
  const buildResult = execWithTimeout('npm run build:optimized', TEST_CONFIG.buildTimeout);
  if (!buildResult) {
    console.error('❌ Échec du build');
    process.exit(1);
  }
  
  const buildTime = Date.now() - buildStart;
  console.log(`✅ Build terminé en ${buildTime}ms\n`);
  
  console.log('🌐 Étape 2: Démarrage du serveur de preview...');
  const previewProcess = execWithTimeout('npm run preview', 10000);
  if (!previewProcess) {
    console.error('❌ Échec du démarrage du serveur');
    process.exit(1);
  }
  
  // Attendre que le serveur soit prêt
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('📊 Étape 3: Analyse Lighthouse...');
  const lighthouseResult = execWithTimeout(
    'npx lighthouse http://localhost:4173 --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless"',
    TEST_CONFIG.lighthouseTimeout
  );
  
  if (!lighthouseResult) {
    console.error('❌ Échec de l\'analyse Lighthouse');
    process.exit(1);
  }
  
  console.log('✅ Analyse Lighthouse terminée\n');
  
  console.log('📈 Étape 4: Analyse des métriques...');
  const metrics = analyzeLighthouseMetrics('./lighthouse-report.json');
  
  if (!metrics) {
    console.error('❌ Impossible d\'analyser les métriques');
    process.exit(1);
  }
  
  const issues = checkPerformanceThresholds(metrics);
  const report = generateReport(metrics, issues, buildTime);
  
  // Affichage des résultats
  console.log('📊 RÉSULTATS DES TESTS DE PERFORMANCE');
  console.log('=====================================');
  console.log(`⏱️  Temps de build: ${report.buildTime}ms`);
  console.log(`📈 Score de performance: ${report.metrics.performanceScore.toFixed(1)}/100`);
  console.log(`🎯 First Contentful Paint: ${report.metrics.firstContentfulPaint.toFixed(0)}ms`);
  console.log(`🎯 Largest Contentful Paint: ${report.metrics.largestContentfulPaint.toFixed(0)}ms`);
  console.log(`🎯 Cumulative Layout Shift: ${report.metrics.cumulativeLayoutShift.toFixed(3)}`);
  console.log(`🎯 First Input Delay: ${report.metrics.firstInputDelay.toFixed(0)}ms`);
  console.log(`🎯 Total Blocking Time: ${report.metrics.totalBlockingTime.toFixed(0)}ms`);
  console.log(`🎯 Speed Index: ${report.metrics.speedIndex.toFixed(0)}ms`);
  
  if (issues.length > 0) {
    console.log('\n⚠️  PROBLÈMES DÉTECTÉS:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('\n✅ Tous les seuils de performance sont respectés !');
  }
  
  console.log(`\n📄 Rapport complet sauvegardé dans: performance-report.json`);
  
  // Nettoyage
  try {
    execSync('rm -f lighthouse-report.json');
  } catch (error) {
    // Ignorer les erreurs de nettoyage
  }
  
  // Code de sortie
  process.exit(report.passed ? 0 : 1);
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

// Exécution des tests
runPerformanceTests().catch(error => {
  console.error('❌ Erreur lors des tests de performance:', error);
  process.exit(1);
}); 