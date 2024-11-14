<script>
	import Puzzles from './src/Puzzles.svelte';

	const { data } = $props();
</script>

<div class="flex min-h-[100vh] w-[100vw] items-center justify-center">
	<Puzzles puzzles={data.puzzles} />
</div>
