import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export function ShoppingListRoute() {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['shopping_list'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Not signed in');
      return api.getShoppingList(token);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Not signed in');
      return api.deleteShoppingItem(id, token);
    },
    onSuccess: () => queryClient.invalidateQueries(['shopping_list'])
  });

  if (listQuery.isLoading) {
    return <LoadingSpinner label="Loading your shopping list..." />;
  }

  if (listQuery.isError) {
    return (
      <EmptyState
        title="Sign in required"
        description="Sign in to sync your shopping list across devices."
      />
    );
  }

  const items = listQuery.data ?? [];

  return (
    <section className="stack">
      <div className="page-header">
        <h1 className="page-title">Shopping list</h1>
        <p className="page-subtitle">
          Ingredients you&apos;ve added from recipes appear here, synced via Supabase.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Your list is empty"
          description="Open any recipe and use “Add ingredients” to start building your list."
        />
      ) : (
        <ul className="stack">
          {items.map((item: any) => (
            <li
              key={item.id}
              className="flex-row"
              style={{
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(31,41,55,1)',
                padding: '0.4rem 0'
              }}
            >
              <span>{item.ingredient}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => deleteMutation.mutate(item.id)}
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
