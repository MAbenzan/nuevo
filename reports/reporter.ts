import type { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

type StepInfo = {
  title: string;
  startTime: number;
  endTime?: number;
  duration?: number;
};

type TestInfoData = {
  id: string;
  title: string;
  fullTitle: string[];
  status: string;
  duration: number;
  steps: StepInfo[];
  attachments: { name: string; type: string; path?: string }[];
};

export default class HtmlReporter implements Reporter {
  private start = Date.now();
  private tests: Map<string, TestInfoData> = new Map();
  private outputDir = path.resolve('reports', 'output');
  private assetsDir = path.join(this.outputDir, 'assets');
  private templatesDir = path.resolve('reports', 'templates');

  onBegin() {
    fs.mkdirSync(this.outputDir, { recursive: true });
    fs.mkdirSync(this.assetsDir, { recursive: true });
  }

  onTestBegin(test: TestCase) {
    const id = this.testId(test);
    const data: TestInfoData = {
      id,
      title: test.title,
      fullTitle: test.titlePath(),
      status: 'running',
      duration: 0,
      steps: [],
      attachments: []
    };
    this.tests.set(id, data);
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep) {
    const id = this.testId(test);
    const data = this.tests.get(id);
    if (!data) return;
    data.steps.push({ title: step.title, startTime: Date.now() });
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep) {
    const id = this.testId(test);
    const data = this.tests.get(id);
    if (!data) return;
    const s = data.steps.find((x) => x.title === step.title && !x.endTime);
    if (!s) return;
    s.endTime = Date.now();
    s.duration = s.endTime - s.startTime;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const id = this.testId(test);
    const data = this.tests.get(id);
    if (!data) return;
    data.status = result.status;
    data.duration = result.duration;
    for (const att of result.attachments) {
      const name = `${id}-${att.name}`.replace(/[^a-zA-Z0-9-_\.]/g, '_');
      const dest = path.join(this.assetsDir, name);
      if (att.path && fs.existsSync(att.path)) {
        fs.copyFileSync(att.path, dest);
        data.attachments.push({ name, type: att.contentType || 'application/octet-stream', path: `assets/${name}` });
      } else if (att.body) {
        fs.writeFileSync(dest, att.body);
        data.attachments.push({ name, type: att.contentType || 'application/octet-stream', path: `assets/${name}` });
      }
    }
    this.tests.set(id, data);
  }

  async onEnd() {
    const summary = this.buildSummary();
    const templatePath = path.join(this.templatesDir, 'index.html');
    const stylesPath = path.join(this.templatesDir, 'styles.css');
    let html = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf-8') : this.defaultHtml();
    const styles = fs.existsSync(stylesPath) ? fs.readFileSync(stylesPath, 'utf-8') : '';
    html = html.replace('/*{{STYLES}}*/', styles);
    const dataScript = `<script id="data" type="application/json">${JSON.stringify(summary)}</script>`;
    html = html.replace('<!--{{DATA}}-->', dataScript);
    fs.writeFileSync(path.join(this.outputDir, 'index.html'), html, 'utf-8');
  }

  private buildSummary() {
    const tests = Array.from(this.tests.values());
    const passed = tests.filter((t) => t.status === 'passed').length;
    const failed = tests.filter((t) => t.status === 'failed').length;
    const skipped = tests.filter((t) => t.status === 'skipped').length;
    const totalDuration = tests.reduce((acc, t) => acc + t.duration, 0);
    return {
      generatedAt: new Date().toISOString(),
      stats: { total: tests.length, passed, failed, skipped, durationMs: totalDuration },
      tests
    };
  }

  private testId(test: TestCase) {
    return test.titlePath().join(' > ').replace(/\s+/g, '_');
  }

  private defaultHtml() {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reporte de Pruebas</title>
  <style>/*{{STYLES}}*/</style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <header class="header">
    <h1>Reporte de Playwright</h1>
  </header>
  <main class="container">
    <section class="summary">
      <div id="summary"></div>
      <canvas id="chart"></canvas>
    </section>
    <section id="tests" class="tests"></section>
  </main>
  <!--{{DATA}}-->
  <script>
    const dataEl = document.getElementById('data');
    const payload = JSON.parse(dataEl.textContent);
    const sEl = document.getElementById('summary');
    const stats = payload.stats;
    sEl.innerHTML = '<div class="cards"'
      + '><div class="card"><h3>Total</h3><p>' + stats.total + '</p></div>'
      + '<div class="card passed"><h3>Passed</h3><p>' + stats.passed + '</p></div>'
      + '<div class="card failed"><h3>Failed</h3><p>' + stats.failed + '</p></div>'
      + '<div class="card skipped"><h3>Skipped</h3><p>' + stats.skipped + '</p></div>'
      + '<div class="card"><h3>Duración(ms)</h3><p>' + stats.durationMs + '</p></div>'
      + '</div>';
    const ctx = document.getElementById('chart');
    new Chart(ctx, { type: 'doughnut', data: { labels: ['Passed','Failed','Skipped'], datasets: [{ data: [stats.passed, stats.failed, stats.skipped], backgroundColor: ['#22c55e','#ef4444','#f59e0b'] }] } });
    const testsEl = document.getElementById('tests');
    payload.tests.forEach(t => {
      const div = document.createElement('div');
      div.className = 'test ' + t.status;
      const stepsHtml = t.steps.map(s => '<li><span>' + s.title + '</span><span>' + (s.duration||0) + 'ms</span></li>').join('');
      const attsHtml = t.attachments.filter(a=>a.path).map(a => '<img src="' + a.path + '" alt="' + a.name + '"/>').join('');
      div.innerHTML = '<h2>' + t.title + '</h2><p>Estado: ' + t.status + ' | Duración: ' + t.duration + 'ms</p>'
        + '<h3>Pasos</h3><ul class="steps">' + stepsHtml + '</ul>'
        + '<h3>Evidencias</h3><div class="attachments">' + attsHtml + '</div>';
      testsEl.appendChild(div);
    });
  </script>
</body>
</html>`;
  }
}