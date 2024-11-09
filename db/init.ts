import { db } from '$lib/db';

db.transaction(() => {
	db.run(`
    drop table if exists words
  `);
	db.run(`
    drop table if exists combinations
  `);
	db.run(`
    create table words (
      word TEXT PRIMARY KEY
    )  
  `);
	db.run(`
    create table combinations (
      left TEXT,
      middle TEXT,
      right TEXT
    )  
  `);
})();
