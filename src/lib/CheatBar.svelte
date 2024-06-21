<script lang="ts">
	import { items } from '../routes/merge/itemState';
	import { onMount } from 'svelte';
  	import type { Item } from './types';
	import toast from 'svelte-french-toast';
	import { io } from 'socket.io-client'

	const socket = io()

	socket.on('join-room', () => {
		toast.success(`User ${socket.id} Joined`, {
			duration: 3000,
		})

	})

	socket.on('word-submitted', 
		(item: Item) => {
			$items.push(item)
		}
	)


	let processing = false;
	let textInput: HTMLInputElement;

	function handleKeydown(event: KeyboardEvent) {
		if (event.code === 'KeyK' && event.ctrlKey) {
			event.preventDefault();
			textInput.focus();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	const submit = async () => {
		if (processing) return;
		processing = true;
		let word = textInput.value;
		let emoji = '';
		let emoji_res = await fetch(`/api/emoji?word=${word}`);
		if (emoji_res.status == 200) emoji = await emoji_res.text();

		const item : Item = {
			word: word,
			emoji: emoji,
			position: {
				x: window.innerWidth / 2 + Math.random() * 600 - 300,
				y: window.innerHeight / 2 + Math.random() * 600 - 300,
			},
			held: false,
			status: 'free',
			id: Math.random(),
		};
		

		socket.emit('submit-word', item)
		$items.push(item);
		if (textInput.value == word) textInput.value = '';
		processing = false;
	};
</script>

<form on:submit={submit}>
	<input type="text" placeholder="add a new item" bind:this={textInput} />
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	{#if textInput?.value?.length > 0}
		<span>Enter</span>
	{:else}
		<span on:click={() => textInput.focus()}>ctrl + k</span>
	{/if}
</form>

<style>
	form {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		margin: 20px auto;
		width: 400px;
		max-width: 60vw;
		border: solid 1px #555;
		border-radius: 100px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-right: 15px;
		user-select: none;
	}
	form span {
		background-color: #f3f3f3;
		border-radius: 7px;
		padding: 3px 10px;
		cursor: pointer;
		user-select: none;
		font-family: sans-serif;
		color: #222;
	}
	@media (max-aspect-ratio: 3/4) {
		form span {
			display: none;
		}
	}
	input {
		border: none;
		background: transparent;
		padding: 10px 25px;
		font-size: 20px;
	}
	input:focus {
		outline: none;
	}
</style>
