const { execSync } = require('child_process');
const path = require('path');

// Enable BuildKit (runs enable-buildkit.js)
console.log('Enabling Docker BuildKit...');
execSync('node scripts/enable-buildkit.js', { stdio: 'inherit' });

// Download dashboards (runs download-dashboards.js)
//console.log('Downloading Grafana dashboards...');
//execSync('node scripts/download-dashboards.js', { stdio: 'inherit' });

//console.log('Patching dahsboard datasources...');
//execSync('node scripts/patch-datasources.js', { stdio: 'inherit' });

//console.log('Patching kafka dashboard vars...');
//execSync('node scripts/patch-kafka-dashboard.js', { stdio: 'inherit' });

console.log('✔️  Pre-up steps complete. Now you can run Docker Compose!');
