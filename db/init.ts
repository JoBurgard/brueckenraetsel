import { db } from '$lib/db';

db.transaction(() => {
	db.run(`
    drop table if exists words
  `);
	db.run(`
    create table words (
      id INTEGER PRIMARY KEY,
      word TEXT NOT NULL UNIQUE
    )  
  `);

	db.run(`
    drop table if exists progress
  `);
	db.run(`
    create table progress (
      id INTEGER PRIMARY KEY,
      last_id INTEGER NOT NULL
    )  
  `);

	db.run(`
    drop table if exists combinations
  `);
	db.run(`
    create table combinations (
      word_id INTEGER NOT NULL,
      left TEXT NOT NULL,
      middle TEXT NOT NULL,
      right TEXT NOT NULL
    )  
  `);
})();
