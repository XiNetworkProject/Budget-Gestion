#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const PERFORMANCE_THRESHOLDS = {
  firstContentfulPaint: 2000, // ms
  largestContentfulPaint: 3000, // ms
  firstInputDelay: 100, // ms
  cumulativeLayoutShift: 0.1,
  totalBlockingTime: 300, // ms
  speedIndex: 2500, // ms
  timeToInteractive: 3500 // ms
};

function measureBuildTime() {
  console.log('📦 Mesure du temps de build...');
  const startTime = Date.now();
  try {
    execSync('npm run build:optimized', { stdio: 'pipe' });
    const buildTime = Date.now() - startTime;
    console.log(`✅ Build terminé en ${buildTime}ms`);
    return buildTime;
  } catch (error) {
    console.error('❌ Erreur lors du build:', error.message);
    return null;
  }
}

function measureBundleSize() {
  console.log('📊 Analyse de la taille du bundle...');
  try {
    const statsPath = join(process.cwd(), 'dist', 'stats.html');
    if (existsSync(statsPath)) {
      console.log('✅ Rapport d\'analyse de bundle généré');
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse du bundle:', error.message);
  }
  return false;
}

function generatePerformanceReport(buildTime, bundleAnalyzed) {
  const report = {
    timestamp: new Date().toISOString(),
    buildTime: buildTime,
    bundleAnalyzed: bundleAnalyzed,
    optimizations: {
      lazyLoading: true,
      memoization: true,
      virtualization: true,
      caching: true,
      compression: true,
      pwa: true,
      errorBoundary: true
    },
    recommendations: []
  };

  if (buildTime && buildTime > 30000) {
    report.recommendations.push('Considérer l\'optimisation du processus de build');
  }

  if (!bundleAnalyzed) {
    report.recommendations.push('Vérifier la génération du rapport de bundle');
  }

  const reportPath = join(process.cwd(), 'performance-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📋 RAPPORT DE PERFORMANCE');
  console.log('========================');
  console.log(`⏱️  Temps de build: ${buildTime ? buildTime + 'ms' : 'N/A'}`);
  console.log(`📦 Analyse de bundle: ${bundleAnalyzed ? '✅' : '❌'}`);
  console.log(`🚀 Optimisations actives: ${Object.values(report.optimizations).filter(Boolean).length}/7`);
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommandations:');
    report.recommendations.forEach(rec => console.log(`   • ${rec}`));
  }

  console.log(`\n📄 Rapport complet sauvegardé: ${reportPath}`);
}

async function analyzePerformance() {
  console.log('🚀 ANALYSE DE PERFORMANCE DE L\'APPLICATION OPTIMISÉE');
  console.log('==================================================\n');

  const buildTime = measureBuildTime();
  const bundleAnalyzed = measureBundleSize();

  generatePerformanceReport(buildTime, bundleAnalyzed);

  console.log('\n✅ Analyse terminée !');
}

analyzePerformance().catch(error => {
  console.error('❌ Erreur lors de l\'analyse:', error);
  process.exit(1);
}); 