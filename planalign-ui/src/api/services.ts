import { apiClient } from './client';
import { Client, BenchmarkDataPoint } from '../types';
import { ExtractedField } from '../utils/adapters';

export interface ClientSummary {
    client_id: string;
    client_name: string;
    industry: string;
    region?: string;
    state?: string;
    employee_count: number;
}

export const api = {
    // Get all clients
    getClients: async (): Promise<ClientSummary[]> => {
        const response = await apiClient.get<ClientSummary[]>('/api/v1/clients');
        return response.data;
    },

    // Get plan design extractions for a client
    getClientExtractions: async (clientId: string): Promise<ExtractedField[]> => {
        const response = await apiClient.get<ExtractedField[]>(`/api/v1/clients/${clientId}/extractions`);
        return response.data;
    },

    // Update a specific field
    updateField: async (clientId: string, fieldName: string, value: any): Promise<any> => {
        const response = await apiClient.patch(`/api/v1/clients/${clientId}/fields/${fieldName}`, {
            value: value,
            reason: "Inline edit via new UI" // Optional reason
        });
        return response.data;
    },

    // Get regional benchmark data
    getRegionalBenchmark: async (clientId: string): Promise<BenchmarkDataPoint[]> => {
        const response = await apiClient.get<BenchmarkDataPoint[]>(`/api/v1/clients/${clientId}/regional-benchmark`);
        return response.data;
    },

    // Create a new client
    createClient: async (data: { name: string; industry: string; region: string; state?: string }): Promise<ClientSummary> => {
        const response = await apiClient.post<ClientSummary>('/api/v1/clients', data);
        return response.data;
    }
};
