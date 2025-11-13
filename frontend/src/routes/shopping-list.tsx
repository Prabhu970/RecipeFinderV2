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

  function toggle(id: number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  function remove(id: number) {
    setItems((prev) => prev.filter((i) => i.id != id));
  }

  return (
    <section className="stack">
      <div className="page-header">
        <h1 className="page-title">Shopping list</h1>
        <p className="page-subtitle">
          Turn recipes into a simple checklist for your next grocery run.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addItem();
        }}
        className="flex-row"
        style={{ gap: '0.5rem', flexWrap: 'wrap' }}
      >
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="2x chicken breast, 1x garlic bulb..."
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Add
        </button>
      </form>
      {items.length === 0 ? (
        <EmptyState
          title="No items yet"
          description="Add ingredients from your recipes or from memory."
        />
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0' }}>
          {items.map((i) => (
            <li
              key={i.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0'
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={i.done}
                  onChange={() => toggle(i.id)}
                />
                <span
                  style={{
                    fontSize: '0.85rem',
                    textDecoration: i.done ? 'line-through' : 'none',
                    color: i.done ? '#6b7280' : undefined
                  }}
                >
                  {i.text}
                </span>
              </label>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => remove(i.id)}
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
