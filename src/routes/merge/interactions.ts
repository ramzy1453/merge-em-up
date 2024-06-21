import {
  vectorAdd,
  vectorSubtract,
  vectorMultiply,
  vectorMagnitude,
  vectorNormalize,
  type Item,
  type Vector2,
} from "$lib/types";
import type { Writable } from "svelte/store";

const merge_queue: Map<number, { emoji: string; word: string }> = new Map();

async function merge(word1: string, word2: string, id: number) {
  try {
    const res = await fetch(`/api/merge?word1=${word1}&word2=${word2}`);
    const data: { word: string; emoji: string } = await res.json();
    merge_queue.set(id, data);
  } catch (error) {
    console.error("Error in merge:", error);
    merge_queue.set(id, { word: word1, emoji: "⛔" });
  }
}

function update(items: Item[]) {
  items.forEach((item) => {
    if (merge_queue.has(item.id)) {
      const mergeItem = merge_queue.get(item.id)!;
      item.status = "free";
      item.word = mergeItem.word;
      item.emoji = mergeItem.emoji;
      merge_queue.delete(item.id);
    }
  });

  items.forEach((item: Item) => {
    if (item.held || item.status == "delete") return;
    items.forEach((other) => {
      if (item.id == other.id || other.status == "delete") return;
      const dif: Vector2 = vectorSubtract(item.position, other.position);
      const dir: Vector2 = vectorNormalize(dif);
      const dist: number = vectorMagnitude(dif);
      let force: number = 100 / (dist ** 1.2 + 20);
      if (other.held) {
        force = -150 / (dist + 70);
      } else if (dist > 400) force = 0;
      item.position = vectorAdd(item.position, vectorMultiply(dir, force));
      if (
        dist < 20 &&
        // HACK so it doesnt merge when duplicating
        item.word != other.word &&
        other.status != "merge" &&
        item.status != "merge" &&
        !other.held
      ) {
        item.status = "delete";
        other.status = "merge";
        merge(item.word, other.word, other.id);
      }
    });
  });
  items.sort((a, b) => Number(a.held) - Number(b.held));
  items = items.filter((item) => item.status !== "delete");

  return items;
}

function update_loop(items: Writable<Item[]>) {
  setInterval(() => {
    items.update(update);
  }, 1000 / 60);
}
export const mouseDown = (
  items: Writable<Item[]>,
  e: MouseEvent | TouchEvent
) => {
  items.update((items) =>
    items.map((item) => {
      const target = e.target as HTMLElement;
      if (target && target.dataset)
        if (Number(target.dataset.id) == item.id) item.held = true;
        else item.held = false;
      return item;
    })
  );
};
export const mouseUp = (items: Writable<Item[]>) => {
  items.update((items) =>
    items.map((item) => {
      item.held = false;
      return item;
    })
  );
};
export const mouseDBClick = (items: Writable<Item[]>, e: MouseEvent) => {
  items.update((items) => {
    const item = items.find(
      (item) => Number((e.target as HTMLElement).dataset.id) === item.id
    );
    if (item) return [...items, duplicate_item(item)];
    else return items;
  });
};

export function duplicate_item(item: Item) {
  if (item.status != "free") return;
  const newItem = JSON.parse(JSON.stringify(item));
  newItem.id = Math.random();
  newItem.position.x += Math.random() * 20 - 10;
  newItem.position.y += Math.random() * 20 - 10;

  return newItem;
}

function mouse_interactions(items: Writable<Item[]>, container: HTMLElement) {
  const handle_mousemove = (e: MouseEvent) => {
    items.update((items) => {
      items.forEach((item) => {
        if (!item.held) return;
        item.position.x = e.clientX;
        item.position.y = e.clientY;
      });
      return items;
    });
  };
  if (typeof container != "undefined") {
    container.addEventListener("mousemove", handle_mousemove);
  }

  const handle_touchmove = (e: TouchEvent) => {
    items.update((items) => {
      items.forEach((item) => {
        if (!item.held) return;
        let touch = e.changedTouches[0];
        item.position.x = touch.clientX;
        item.position.y = touch.clientY;
      });
      return items;
    });
  };

  if (typeof container != "undefined") {
    container.addEventListener("touchmove", handle_touchmove);
  }
}

export function initSimulation(
  items: Writable<Item[]>,
  container: HTMLElement
) {
  if (typeof window == "undefined") return;
  mouse_interactions(items, container);
  update_loop(items);
}
