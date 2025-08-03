import { createClient, type Client } from "@libsql/client";

// Create a libSQL client only when the database URL is available. During build
// or local development the environment variables might be missing, which would
// normally cause `createClient` to throw. In that case, fall back to a stubbed
// client that simply returns empty result sets.
let db: Client;

if (process.env.TURSO_DATABASE_URL) {
  db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
} else {
  db = {
    execute: async () => ({ rows: [] }),
  } as unknown as Client;
}

export { db };
