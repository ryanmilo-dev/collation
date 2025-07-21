const fs = require('fs');
const https = require('https');
const path = require('path');

const dashboards = [
  1860,    // Node Exporter
  7589,    // Kafka
  9628,    // Postgres
  20867,   // MongoDB
  763,     // Redis
  3662     // Prometheus Server
];

const targetDir = path.join(__dirname, '../grafana/dashboards');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

dashboards.forEach((id) => {
  const url = `https://grafana.com/api/dashboards/${id}/revisions/latest/download`;
  const outFile = path.join(targetDir, `dashboard-${id}.json`);
  console.log(`Downloading dashboard ${id}...`);

  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Failed to download dashboard ${id}: HTTP ${res.statusCode}`);
      return;
    }
    const file = fs.createWriteStream(outFile);
    res.pipe(file);
    file.on('finish', () => file.close());
  }).on('error', (err) => {
    console.error(`Error downloading dashboard ${id}:`, err.message);
  });
});
