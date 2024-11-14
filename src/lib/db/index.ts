import { Database } from 'bun:sqlite';

export const db = new Database('./db/words.sqlite', {
	strict: true,
	create: false,
});
db.exec('PRAGMA journal_mode = WAL;');

process.on('exit', () => {
	db.close(true);
});
