const cron = require('node-cron');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '..', 'public', 'mega-sena.csv');
const API_BASE = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena';

function fetchJson(url) {
  const output = execSync(`curl -s ${url}`, { encoding: 'utf8' });
  return JSON.parse(output);
}

function getLastConcurso() {
  const lines = fs.readFileSync(CSV_PATH, 'utf8').trim().split('\n');
  const last = lines[lines.length - 1].split(',')[0];
  return parseInt(last, 10);
}

function fetchConcurso(numero) {
  return fetchJson(`${API_BASE}/${numero}`);
}

function updateMegaSena() {
  try {
    const last = getLastConcurso();
    const latest = fetchJson(API_BASE);
    const latestNumber = parseInt(latest.numero, 10);

    for (let n = last + 1; n <= latestNumber; n++) {
      const draw = fetchConcurso(n);
      const line = `${String(draw.numero).padStart(4, '0')},${draw.dataApuracao},${draw.listaDezenas.join(',')}\n`;
      fs.appendFileSync(CSV_PATH, line);
      console.log(`Concurso ${draw.numero} adicionado`);
    }
  } catch (err) {
    console.error('Erro ao atualizar Mega-Sena:', err.message);
  }
}

cron.schedule('0 0 * * *', updateMegaSena);
updateMegaSena();
