import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function ShoppingListRoute() {
  const [list, setList] = useState<any[]>([]);

  async function loadList() {
    const { data } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("user_id", supabase.auth.user()?.id);
    setList(data || []);
  }

  async function updateQty(id: string, delta: number) {
    const item = list.find((i) => i.id === id);
    if (!item) return;

    const newQty = Math.max(1, item.total_qty + delta);

    await supabase
      .from("shopping_list")
      .update({ total_qty: newQty })
      .eq("id", id);

    loadList();
  }

  async function removeItem(id: string) {
    await supabase.from("shopping_list").delete().eq("id", id);
    loadList();
  }

  useEffect(() => {
    loadList();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">Shopping List</h1>

      {list.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center py-3 border-b border-gray-700"
        >
          <span className="capitalize text-lg">{item.ingredient_clean}</span>

          <div className="flex items-center gap-4">
            <button
              className="px-3 py-1 bg-gray-700 rounded"
              onClick={() => updateQty(item.id, -1)}
            >
              -
            </button>

            <span className="text-xl font-semibold w-6 text-center">
              {item.total_qty}
            </span>

            <button
              className="px-3 py-1 bg-gray-700 rounded"
              onClick={() => updateQty(item.id, +1)}
            >
              +
            </button>

            <button
              className="px-4 py-1 bg-red-500 rounded"
              onClick={() => removeItem(item.id)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
