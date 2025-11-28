import fs from 'fs';
import path from 'path';

const logDir = path.resolve('reports', 'db-logs');
fs.mkdirSync(logDir, { recursive: true });

const filePath = path.join(logDir, 'db.log');

export function log(message: string) {
  const line = `${new Date().toISOString()} ${message}`;
  fs.appendFileSync(filePath, line + '\n');
}