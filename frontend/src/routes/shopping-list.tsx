import { useState } from 'react';
import { EmptyState } from '../components/common/EmptyState';

interface Item {
  id: number;
  text: string;
  done: boolean;
}

export function ShoppingListRoute() {
  const [items, setItems] = useState<Item[]>([]);
  const [text, setText] = useState('');

  function addItem() {
    if (!text.trim()) return;
    setItems((prev) => [...prev, { id: Date.now(), text: text.trim(), done: false }]);
    setText('');
  }

  function toggleItem(id: number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Shopping list</h1>
        <p className="text-sm text-muted-foreground">
          Turn your recipes into a clear checklist for the store.
        </p>
      </header>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addItem();
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="2x chicken breast, 1x garlic..."
          className="flex-1 h-9 rounded-md border px-2 text-sm bg-background"
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="Your list is empty"
          description="Add ingredients from recipes or manually type your own items."
        />
      ) : (
        <ul className="divide-y rounded-md border">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <label className="flex items-center gap-2 flex-1">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleItem(item.id)}
                  className="h-4 w-4 rounded border"
                />
                <span className={item.done ? 'line-through text-muted-foreground' : ''}>
                  {item.text}
                </span>
              </label>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
