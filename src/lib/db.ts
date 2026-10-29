import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const g = globalThis as unknown as { __db?: Database.Database };

function open(): Database.Database {
  const db = new Database(path.join(dataDir, "dashboard.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Sonstiges',
      cost_cents INTEGER NOT NULL DEFAULT 0,
      interval_months INTEGER NOT NULL DEFAULT 1,
      start_date TEXT NOT NULL,
      min_term_months INTEGER NOT NULL DEFAULT 12,
      renewal_months INTEGER NOT NULL DEFAULT 12,
      notice_days INTEGER NOT NULL DEFAULT 30,
      customer_no TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      stored_name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reminders_sent (
      contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
      cancel_by TEXT NOT NULL,
      threshold INTEGER NOT NULL,
      PRIMARY KEY (contract_id, cancel_by, threshold)
    );
  `);
  return db;
}

export const db = g.__db ?? (g.__db = open());

export type Contract = {
  id: number;
  provider: string;
  category: string;
  cost_cents: number;
  interval_months: number;
  start_date: string;
  min_term_months: number;
  renewal_months: number;
  notice_days: number;
  customer_no: string;
  notes: string;
};

export type Doc = { id: number; contract_id: number; filename: string; stored_name: string };

export function monthlyCents(c: Contract): number {
  return Math.round(c.cost_cents / Math.max(1, c.interval_months));
}
