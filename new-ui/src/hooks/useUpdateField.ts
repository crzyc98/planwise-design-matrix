import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/services';
import { uiToBackend } from '../utils/adapters';
import { PlanData } from '../types';

export const useUpdateField = (clientId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ fieldId, value }: { fieldId: string; value: any }) => {
            const { field_name, value: backendValue } = uiToBackend(fieldId, value);
            return api.updateField(clientId, field_name, backendValue);
        },
        onMutate: async ({ fieldId, value }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['planData', clientId] });

            // Snapshot previous value
            const previousPlanData = queryClient.getQueryData<PlanData>(['planData', clientId]);

            // Optimistically update to new value
            queryClient.setQueryData<PlanData>(['planData', clientId], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    [fieldId]: value
                };
            });

            return { previousPlanData };
        },
        onError: (err, newTodo, context) => {
            // Rollback on error
            if (context?.previousPlanData) {
                queryClient.setQueryData(['planData', clientId], context.previousPlanData);
            }
            console.error('Failed to update field:', err);
        },
        onSettled: () => {
            // Refetch to ensure sync
            queryClient.invalidateQueries({ queryKey: ['planData', clientId] });
        }
    });
};

export const useGenericUpdateField = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ clientId, fieldId, value }: { clientId: string; fieldId: string; value: any }) => {
            const { field_name, value: backendValue } = uiToBackend(fieldId, value);
            return api.updateField(clientId, field_name, backendValue);
        },
        onMutate: async ({ clientId, fieldId, value }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['planData', clientId] });
            await queryClient.cancelQueries({ queryKey: ['clients'] }); // Also update client list if needed

            // Snapshot previous value
            const previousPlanData = queryClient.getQueryData<PlanData>(['planData', clientId]);

            // Optimistically update to new value
            queryClient.setQueryData<PlanData>(['planData', clientId], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    [fieldId]: value
                };
            });

            return { previousPlanData };
        },
        onError: (err, newTodo, context) => {
            // Rollback on error
            if (context?.previousPlanData) {
                queryClient.setQueryData(['planData', newTodo.clientId], context.previousPlanData);
            }
            console.error('Failed to update field:', err);
        },
        onSettled: (data, error, variables) => {
            // Refetch to ensure sync
            queryClient.invalidateQueries({ queryKey: ['planData', variables.clientId] });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        }
    });
};
