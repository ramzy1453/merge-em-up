import { writable, type Writable } from "svelte/store";
import type { Item } from "$lib/types";

export const items: Writable<Item[]> = writable([]);
if (typeof window != "undefined") {
  items.set([
    {
      word: "earth",
      emoji: "🪨",
      position: {
        x: window.innerWidth / 2 + Math.random() * 600 - 300,
        y: window.innerHeight / 2 + Math.random() * 600 - 300,
      },
      held: false,
      status: "free",
      id: Math.random(),
    },
  ]);
}
