// @ts-nocheck
import cron from "node-cron";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";
import { CAIXA_API_BASE } from "../src/lib/constants";

const CSV_PATH = path.join(__dirname, "..", "public", "mega-sena.csv");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function fetchJson(url: string) {
  const output = execSync(`curl -s ${url}`, { encoding: "utf8" });
  return JSON.parse(output);
}

function getLastConcurso() {
  const lines = fs.readFileSync(CSV_PATH, "utf8").trim().split("\n");
  const last = lines[lines.length - 1].split(",")[0];
  return parseInt(last, 10);
}

function fetchConcurso(numero: number) {
  return fetchJson(`${CAIXA_API_BASE}/${numero}`);
}

async function insertDraw(draw: any) {
  await db.execute({
    sql: `INSERT OR IGNORE INTO history (concurso, data, bola1, bola2, bola3, bola4, bola5, bola6) VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
    args: [draw.numero, draw.dataApuracao, ...draw.listaDezenas],
  });
}

async function updateMegaSena() {
  try {
    const last = getLastConcurso();
    const latest = fetchJson(CAIXA_API_BASE);
    const latestNumber = parseInt(latest.numero, 10);

    for (let n = last + 1; n <= latestNumber; n++) {
      const draw = fetchConcurso(n);
      const line = `${String(draw.numero).padStart(4, "0")},${draw.dataApuracao},${draw.listaDezenas.join(",")}\n`;
      fs.appendFileSync(CSV_PATH, line);
      await insertDraw(draw);
      console.log(`Concurso ${draw.numero} adicionado`);
    }
  } catch (err: any) {
    console.error("Erro ao atualizar Mega-Sena:", err.message);
  }
}

cron.schedule("0 0 * * *", updateMegaSena);
updateMegaSena();

