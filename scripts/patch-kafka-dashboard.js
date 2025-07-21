const fs = require('fs');
const path = require('path');

const dashboardsDir = path.join(__dirname, '../grafana/dashboards');

// Set your desired defaults:
const FORCE_DATASOURCE = 'DS_PROMETHEUS';
const JOB_DEFAULT = 'kafka';
const INSTANCE_DEFAULT = 'kafka_exporter:9308';
const TOPIC_DEFAULT = 'test-topic';

fs.readdirSync(dashboardsDir).forEach(file => {
  if (!file.endsWith('.json')) return;

  const filePath = path.join(dashboardsDir, file);
  let dashboard = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Patch panels (and recursively nested panels)
  const patchPanels = panels => {
    panels.forEach(panel => {
      if (panel.datasource) panel.datasource = FORCE_DATASOURCE;
      if (panel.panels) patchPanels(panel.panels);
    });
  };
  if (dashboard.panels) patchPanels(dashboard.panels);
  if (dashboard.rows) dashboard.rows.forEach(row => {
    if (row.panels) patchPanels(row.panels);
  });

  // Patch templating variables
  if (dashboard.templating && Array.isArray(dashboard.templating.list)) {
    dashboard.templating.list.forEach(item => {
      if (item.datasource) item.datasource = FORCE_DATASOURCE;

      if (item.name === 'job') {
        item.current = { text: JOB_DEFAULT, value: JOB_DEFAULT };
        item.options = [{ text: JOB_DEFAULT, value: JOB_DEFAULT, selected: true }];
      }
      if (item.name === 'instance') {
        item.current = { text: INSTANCE_DEFAULT, value: INSTANCE_DEFAULT };
        item.options = [{ text: INSTANCE_DEFAULT, value: INSTANCE_DEFAULT, selected: true }];
      }
      if (item.name === 'topic') {
        item.current = { text: TOPIC_DEFAULT, value: TOPIC_DEFAULT };
        item.options = [{ text: TOPIC_DEFAULT, value: TOPIC_DEFAULT, selected: true }];
      }
    });
  }

  // Patch __inputs if present
  if (dashboard.__inputs && Array.isArray(dashboard.__inputs)) {
    dashboard.__inputs.forEach(input => {
      if (input.type === "datasource" && input.pluginId === "prometheus") {
        input.name = FORCE_DATASOURCE;
      }
    });
  }

  fs.writeFileSync(filePath, JSON.stringify(dashboard, null, 2));
  console.log(`Patched dashboard: ${file}`);
});
