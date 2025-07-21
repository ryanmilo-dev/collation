const fs = require('fs');
const path = require('path');

const dashboardsDir = path.join(__dirname, '../grafana/dashboards');
const forceDatasource = 'DS_PROMETHEUS';

fs.readdirSync(dashboardsDir).forEach(file => {
  if (!file.endsWith('.json')) return;

  const filePath = path.join(dashboardsDir, file);
  let dashboard = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Patch templating.list datasources
  if (dashboard.templating && Array.isArray(dashboard.templating.list)) {
    dashboard.templating.list.forEach(item => {
      if (item.datasource) item.datasource = forceDatasource;
    });
  }

  // Patch panels
  const patchPanels = panels => {
    panels.forEach(panel => {
      if (panel.datasource) panel.datasource = forceDatasource;
      // Recursively patch nested panels (rows, etc.)
      if (panel.panels) patchPanels(panel.panels);
    });
  };
  if (dashboard.panels) patchPanels(dashboard.panels);
  if (dashboard.rows) dashboard.rows.forEach(row => {
    if (row.panels) patchPanels(row.panels);
  });

  // Patch top-level dashboard datasource (some dashboards use this)
  if (dashboard.datasource) dashboard.datasource = forceDatasource;

  fs.writeFileSync(filePath, JSON.stringify(dashboard, null, 2));
  console.log(`Patched datasource in ${file}`);
});
