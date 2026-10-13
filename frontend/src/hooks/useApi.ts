// React Query hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getModelInfo,
  predictSingle,
  predictBatch,
  getClaims,
  getClaim,
  searchClaims,
  getAnalyticsSummary,
  getRiskDistribution,
  getTopRiskClaims,
} from '@/services/api';
import type { ClaimsFilters, ClaimInput, ClaimsListResponse } from '@/types/api';

// Model
export function useModelInfo() {
  return useQuery({
    queryKey: ['modelInfo'],
    queryFn: () => getModelInfo().then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Predictions
export function usePredictSingle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ claim, threshold }: { claim: ClaimInput; threshold?: number }) =>
      predictSingle(claim, threshold).then(res => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['claims'] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function usePredictBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => predictBatch(file).then(res => res.data as ClaimsListResponse),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['claims'] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// Claims
export function useClaims(filters: ClaimsFilters = {}) {
  return useQuery({
    queryKey: ['claims', filters],
    queryFn: () => getClaims(filters).then(res => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useClaim(claimIndex: number) {
  return useQuery({
    queryKey: ['claim', claimIndex],
    queryFn: () => getClaim(claimIndex).then(res => res.data),
    enabled: !!claimIndex,
  });
}

export function useSearchClaims(params: {
  q?: string;
  risk_level?: string;
  min_prob?: number;
  max_prob?: number;
}) {
  return useQuery({
    queryKey: ['searchClaims', params],
    queryFn: () => searchClaims(params).then(res => res.data),
    enabled: !!(params.q || params.risk_level || params.min_prob || params.max_prob),
  });
}

// Analytics
export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: () => getAnalyticsSummary().then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRiskDistribution() {
  return useQuery({
    queryKey: ['riskDistribution'],
    queryFn: () => getRiskDistribution().then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });
}

export function useTopRiskClaims(n: number = 10) {
  return useQuery({
    queryKey: ['topRiskClaims', n],
    queryFn: () => getTopRiskClaims(n).then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });
}
