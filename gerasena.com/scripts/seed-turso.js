const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

const CSV_PATH = path.join(__dirname, '..', 'public', 'mega-sena.csv');

async function seed() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  await db.execute(`CREATE TABLE IF NOT EXISTS history (
    concurso INTEGER PRIMARY KEY,
    data TEXT,
    bola1 INT,
    bola2 INT,
    bola3 INT,
    bola4 INT,
    bola5 INT,
    bola6 INT
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS gerador (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bola1 INT,
    bola2 INT,
    bola3 INT,
    bola4 INT,
    bola5 INT,
    bola6 INT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  const lines = fs.readFileSync(CSV_PATH, 'utf8').trim().split('\n').slice(1);
  for (const line of lines) {
    const [concurso, data, b1, b2, b3, b4, b5, b6] = line.split(',');
    await db.execute({
      sql: `INSERT OR IGNORE INTO history (concurso, data, bola1, bola2, bola3, bola4, bola5, bola6) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [concurso, data, b1, b2, b3, b4, b5, b6],
    });
  }

  console.log('Seed completed');
  await db.close();
}

seed();
