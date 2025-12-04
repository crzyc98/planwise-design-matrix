import { useQuery } from '@tanstack/react-query';
import { api } from '../api/services';
import { backendToUI } from '../utils/adapters';
import { PlanData } from '../types';

export const usePlanData = (clientId: string) => {
    return useQuery({
        queryKey: ['planData', clientId],
        queryFn: async () => {
            if (!clientId) throw new Error('Client ID is required');

            const extractions = await api.getClientExtractions(clientId);
            return backendToUI(extractions);
        },
        enabled: !!clientId
    });
};
