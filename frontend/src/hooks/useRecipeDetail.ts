import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useRecipeDetail(id: string) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: () => api.getRecipeDetail(id),
    enabled: !!id
  });
}
