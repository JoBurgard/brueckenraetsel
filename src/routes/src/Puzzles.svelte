<script lang="ts">
	import type { PuzzleClient } from '../+page.server';
	import Confetti from './Confetti.svelte';
	import Guessword from './Guessword.svelte';

	let { puzzles: puzzlesProp }: { puzzles: PuzzleClient[] } = $props();
	let puzzles = $state(puzzlesProp);
	let guesses: string[][] = $state(Array.from({ length: puzzles.length }).fill([]) as string[][]);
	let usedTips: number[][] = $state(Array.from({ length: puzzles.length }).fill([]) as number[][]);
	let abandoned: number[] = $state([]);

	function getStatus(index: number) {
		switch (true) {
			case abandoned.includes(index):
				return 'abandoned';
			case guesses[index].join('') === puzzles[index].middle:
				return 'solved';
			default:
				return 'initial';
		}
	}
</script>

<div class="flex flex-col items-center gap-4">
	{#each puzzles as item, index (`${item.left}${item.middle}${item.right}`)}
		<div class="relative">
			<div class="flex gap-1.5">
				<div class="select-none">{item.left[0].toUpperCase()}{item.left.slice(1)}</div>
				<Guessword
					bind:guess={guesses[index]}
					length={item.middle.length}
					usedTips={usedTips[index]}
					status={getStatus(index)}
				/>
				<div class="select-none">{item.right}</div>
				<button
					class="relative inline-flex rounded-md border bg-gray-200 p-1 text-sm leading-none shadow-sm [&:disabled]:text-gray-400"
					disabled={getStatus(index) === 'solved' || getStatus(index) === 'abandoned'}
					onclick={() => {
						if (item.tips.length > 0) {
							const tip = puzzles[index].tips.shift()!;
							usedTips[index].push(tip[0]);
							guesses[index][tip[0]] = tip[1];
						} else {
							abandoned.push(index);
							guesses[index] = Array.from(item.middle);
						}
					}}
				>
					<div class="invisible">Auflösen</div>
					<div class="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
						{#if item.tips.length > 0}
							Tipp
							<div class="flex gap-[2px]">
								{#each item.tips as _}
									<div class="h-3 w-1 bg-green-600"></div>
								{/each}
							</div>
						{:else}
							Auflösen
						{/if}
					</div>
				</button>
			</div>
			{#if getStatus(index) === 'solved'}
				<div class="absolute left-1/2 top-0">
					<Confetti />
				</div>
			{/if}
		</div>
	{/each}
</div>
