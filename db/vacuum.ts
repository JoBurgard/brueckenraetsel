import { db } from '$lib/db';

db.exec('VACUUM');
db.exec('PRAGMA wal_checkpoint(TRUNCATE)');

process.exit(0);
