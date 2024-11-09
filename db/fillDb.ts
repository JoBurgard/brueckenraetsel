import { db } from '$lib/db';
import * as readline from 'node:readline/promises';
import { createReadStream } from 'node:fs';

db.run('delete from words');
const insertWord = db.prepare('insert into words values (?) on conflict do nothing');
const insertLines = db.transaction((lines: string[]) => {
	for (const line of lines) {
		insertWord.run(line);
	}
});
const fileStream = createReadStream(`${__dirname}/input/words_de.txt`);

console.time('Insert words into db');
console.log('Insert words into db...');
const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity
});

let count = 0;
const inserts: string[] = [];
for await (const line of rl) {
	inserts.push(line.toLowerCase());
	count += 1;
	if (inserts.length >= 1000) {
		insertLines(inserts);
		console.log(`${count} entries added`);
		inserts.length = 0;
	}
}
insertLines(inserts);
console.log(`${count} entries added`);

rl.close();
console.timeEnd('Insert words into db');

console.time('Generating combinations');
console.log('Generate combinations data...');
db.run(`
  insert into combinations
  select
    w1.word as left,
    main.word as middle,
    w2.word as right
  from
    words main
  right join words w1 on
    substr(lower(w1.word), -1 * (length(main.word))) = lower(main.word)
    and (length(w1.word) - length(main.word) > 2)
    and exists(
    select
      1
    from
      words we
    where
      substr(w1.word, 0, (length(w1.word) + 1 - length(main.word))) = we.word
    )
  right join words w2 on
    substr(lower(w2.word), 0, length(main.word) + 1) = lower(main.word)
    and (length(w1.word) - length(main.word) > 2)
    and exists(
    select
      1
    from
      words we
    where
      substr(w2.word, length(main.word) + 1) = we.word
    )
  where
    length(main.word) > 2
`);
console.timeEnd('Generating combinations');

process.exit(0);
