import { db } from '$lib/db';

export type PuzzleDB = { left: string; middle: string; right: string; [x: string]: any };
export type PuzzleClient = PuzzleDB & { tips: [number, string][] };
export const load = async () => {
	const getPuzzles = db.query<PuzzleDB, []>(
		'select left, middle, right from combinations order by random() limit 1',
	);

	const puzzles: PuzzleClient[] = [];

	while (puzzles.length < 5) {
		const puzzle = getPuzzles.get()!;

		if (!puzzles.some((it) => it.middle === puzzle?.middle)) {
			puzzle.tips = [
				[0, puzzle.middle.slice(0, 1)],
				[puzzle.middle.length - 1, puzzle.middle.slice(-1)],
			];

			if (puzzle.middle.length > 5) {
				puzzle.tips.push([
					Math.floor((puzzle.middle.length - 1) / 2),
					puzzle.middle.slice(
						Math.floor((puzzle.middle.length - 1) / 2),
						Math.floor((puzzle.middle.length - 1) / 2) + 1,
					),
				]);
			}

			puzzles.push(puzzle as PuzzleClient);
		}
	}

	return {
		puzzles,
	};
};
