import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAIGenerator() {
  return useMutation({
    mutationFn: api.generateAIRecipe
  });
}
