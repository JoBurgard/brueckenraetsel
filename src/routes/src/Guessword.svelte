<script lang="ts">
	import { twJoin } from 'tailwind-merge';

	let {
		length,
		guess = $bindable(Array.from({ length }).fill('') as string[]),
		usedTips,
		status = 'initial',
	}: {
		length: number;
		guess: string[];
		usedTips: number[];
		status: 'initial' | 'solved' | 'abandoned';
	} = $props();

	let wrapper: HTMLDivElement;

	function moveLeft(index: number) {
		while (index > 0) {
			const element = wrapper.querySelector<HTMLInputElement>(
				`[data-index="${index - 1}"]:enabled`,
			);
			if (element) {
				element.focus();
				element.setSelectionRange(1, 1);
				break;
			}
			index -= 1;
		}
	}
	function moveRight(index: number) {
		while (index < length - 1) {
			const element = wrapper.querySelector<HTMLInputElement>(
				`[data-index="${index + 1}"]:enabled`,
			);
			if (element) {
				element.focus();
				element.setSelectionRange(1, 1);
				break;
			}
			index += 1;
		}
	}
</script>

<div bind:this={wrapper} class="flex items-center gap-1">
	{#each Array.from({ length }) as _, index}
		<input
			class={twJoin(
				'size-6 select-none rounded-md border-2 bg-white p-0 text-center text-sm',
				(status === 'solved' || usedTips.includes(index)) && 'pointer-events-none border-green-500',
				status === 'abandoned' && 'border-red-500',
			)}
			data-index={index}
			disabled={status === 'solved' || status === 'abandoned' || usedTips.includes(index)}
			bind:value={guess[index]}
			onkeydown={(event) => {
				const key = event.key;
				if (key === 'ArrowLeft') {
					moveLeft(index);
					event.preventDefault();
					return;
				}
				if (key === 'ArrowRight') {
					moveRight(index);
					event.preventDefault();
					return;
				}
				if (key === 'Backspace') {
					if (status === 'solved') {
						return;
					}
					if (guess[index]) {
						guess[index] = '';
						event.preventDefault();
					} else {
						moveLeft(index);
						if (index > 0 && !usedTips.includes(index - 1)) {
							guess[index - 1] = '';
						}
						event.preventDefault();
					}
					return;
				}
				if (/^[0-9]$/.test(key)) {
					event.preventDefault();
				}
				if (/^[a-zA-Zäöü]$/.test(key)) {
					guess[index] = key.toLowerCase();
					moveRight(index);
					event.preventDefault();
				}
			}}
		/>
	{/each}
</div>
