import { db } from '$lib/db';

console.time('Generating combinations');
console.log('Generate combinations data...');

type InsertsReturn = { last_id: number };

const fillCombinations = db.transaction((last_id: number) => {
	const inserts = db
		.prepare<InsertsReturn, [number]>(
			`
        insert into combinations
        select
          main.id as word_id,
          substr(w1.word, 0, (length(w1.word) + 1 - length(main.word))) as left,
          main.word as middle,
          substr(w2.word, length(main.word) + 1) as right
        from
          words main
        right join words w1 on
          substr(w1.word, -1 * (length(main.word))) = main.word
          and (length(w1.word) - length(main.word)) > 2
          and exists(
          select
            1
          from
            words we
          where
            substr(w1.word, 0, (length(w1.word) + 1 - length(main.word))) = we.word
          )
        right join words w2 on
          substr(w2.word, 0, length(main.word) + 1) = main.word
          and (length(w2.word) - length(main.word)) > 2
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
          and main.id = ?
        returning
          word_id as last_id
      `,
		)
		.all(last_id + 1);

	if (inserts.length > 0) {
		db.query(`insert or replace into progress (id, last_id) values (?, ?)`).run(
			1,
			inserts[0].last_id,
		);
	}

	return inserts;
});

let { last_id } = db
	.query<{ last_id: number } | null, []>('select last_id from progress limit 1')
	.get() ?? {
	last_id: 0,
};
let { max } = db.query<{ max: number }, []>('select max(id) as max from words').get()!;

let total = 0;
let startTime = performance.now();
while (last_id < max) {
	const info = fillCombinations(last_id) as InsertsReturn[];
	if (info.length === 0 && last_id < max) {
		last_id += 1;
		continue;
	} else {
		last_id = info[0].last_id;
		total += info.length;
		console.log(
			`${total} entries added (+${info.length} in ${((performance.now() - startTime) / 1000).toFixed(1)}s)`,
		);
		startTime = performance.now();
	}
}
console.log(`${total} entries added`);
console.timeEnd('Generating combinations');

process.exit(0);
