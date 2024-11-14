import { db } from '$lib/db';
import * as readline from 'node:readline/promises';
import { createReadStream } from 'node:fs';

const insertWord = db.prepare('insert into words (word) values (?) on conflict do nothing');
const insertLines = db.transaction((lines: string[]) => {
	for (const line of lines) {
		insertWord.run(line);
	}
});
const fileStream = createReadStream(`${import.meta.dir}/input/de_DE_frami.dic`);

db.run('delete from words');
console.time('Insert words into db');
console.log('Insert words into db...');
const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity
});

let count = 0;
const inserts: string[] = [];
const headerLines = 18;
const minWordLength = 4;
for await (const line of rl) {
	count += 1;
	if (count <= headerLines) {
		console.log(line);
		continue;
	}

	// prettier-ignore
	let word = line
		.split('/')[0]

	if (word.includes('Innen') || word.endsWith('ungs') || word.length < minWordLength) {
		continue;
	}

	word = word.toLowerCase();

	inserts.push(word);
	if (inserts.length >= 1000) {
		insertLines(inserts);
		console.log(`${count - headerLines} entries added`);
		inserts.length = 0;
	}
}
insertLines(inserts);
console.log(`${count - headerLines} entries added`);

rl.close();
console.timeEnd('Insert words into db');

process.exit(0);
