import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/services';
import { Client } from '../types';

export const useClients = () => {
    return useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const summaries = await api.getClients();

            // Map backend summaries to UI Client objects
            return summaries.map(s => ({
                id: s.client_id,
                name: s.client_name,
                industry: s.industry,
                region: s.region || s.state || 'Unknown', // Fallback logic
                state: s.state,
                lastUpdated: new Date().toISOString(), // Mock for now
                plan: {} as any // Plan data loaded separately
            } as Client));
        }
    });
};

export const useCreateClient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.createClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        }
    });
};
