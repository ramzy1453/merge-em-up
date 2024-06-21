<script lang="ts">
	import {
		initSimulation,
		mouseUp,
		mouseDown,
		mouseDBClick,
	} from './interactions';
	import { items } from './itemState';
	import CheatBar from '$lib/CheatBar.svelte';
	import Help from '$lib/Help.svelte';
	import { onMount } from 'svelte';
	let show_help = false;
	let show_menu = false;
	let container: HTMLElement;
	import ItemDiv from '$lib/ItemDiv.svelte';
	import { Toaster } from 'svelte-french-toast';

	onMount(() => {
		initSimulation(items, container);
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<main
	bind:this={container}
	on:mousedown={(e) => mouseDown(items, e)}
	on:mouseup={(e) => mouseUp(items)}
	on:touchstart={(e) => mouseDown(items, e)}
	on:touchend={(e) => mouseUp(items)}
	on:mouseleave={(e) => mouseUp(items)}
	on:dblclick={(e) => mouseDBClick(items, e)}
>
	<CheatBar />
	<Toaster />

	{#each $items as item (item.id)}
		<ItemDiv {item} />
	{/each}

	<div class="buttons">
		<button on:click={() => (show_help = !show_help)}>?</button>
		<button on:click={() => (show_menu = !show_menu)}>=</button>
	</div>
	<div class="overlays">
		{#if show_help}
			<Help />
		{/if}
	</div>
</main>

<style>
	main {
		width: 100%;
		height: 100vh;
		position: relative;
		overflow: hidden;
	}
	.buttons {
		position: absolute;
		bottom: 0;
		right: 0;
		padding: 20px;
		display: flex;
		gap: 10px;
		user-select: none;
	}
	.buttons button {
		width: 40px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #fffe;
		border-radius: 100%;
		border: solid #222 1px;
		font-family: sans-serif;
		font-size: 20px;
		font-weight: 300;
		cursor: pointer;
	}
	.overlays {
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		pointer-events: none;
	}
</style>
