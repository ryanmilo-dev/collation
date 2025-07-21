const fs = require('fs');
const path = require('path');
const os = require('os');

const configDir = path.join(os.homedir(), '.docker');
const configFile = path.join(configDir, 'config.json');

let config = {};

if (fs.existsSync(configFile)) {
  config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
}

// Ensure "features" and BuildKit are enabled (always use string "true")
if (!config.features) config.features = {};
config.features.buildkit = "true";

if (!fs.existsSync(configDir)) fs.mkdirSync(configDir);

fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
console.log('✅ Docker BuildKit enabled in ~/.docker/config.json');
