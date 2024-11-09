import { Database } from 'bun:sqlite';

export const db = new Database(`${__dirname}/../../db/main.sqlite`, { strict: true });
db.exec('PRAGMA journal_mode = WAL;');

process.on('exit', () => {
	db.close(false);
});
