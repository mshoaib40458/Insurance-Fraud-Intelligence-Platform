// API Service Layer

import axios from 'axios';
import type {
  ClaimInput,
  PredictionResponse,
  ModelInfo,
  ClaimsListResponse,
  ClaimDetail,
  AnalyticsSummary,
  RiskDistribution,
  TopRiskClaimsResponse,
  ClaimsFilters,
} from '@/types/api';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check
export const healthCheck = () => api.get('/');

// Model info
export const getModelInfo = () => api.get<ModelInfo>('/model/info');

// Predictions
export const predictSingle = (claim: ClaimInput, threshold?: number) =>
  api.post<PredictionResponse>('/predict', claim, { params: { threshold } });

export const predictBatch = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/predict/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Claims
export const getClaims = (filters: ClaimsFilters = {}) =>
  api.get<ClaimsListResponse>('/claims', { params: filters });

export const searchClaims = (params: {
  q?: string;
  risk_level?: string;
  min_prob?: number;
  max_prob?: number;
}) => api.get<ClaimsListResponse>('/claims/search', { params });

export const getClaim = (claimIndex: number) =>
  api.get<ClaimDetail>(`/claims/${claimIndex}`);

// Analytics
export const getAnalyticsSummary = () =>
  api.get<AnalyticsSummary>('/analytics/summary');

export const getRiskDistribution = () =>
  api.get<RiskDistribution>('/analytics/risk-dist');

export const getTopRiskClaims = (n: number = 10) =>
  api.get<TopRiskClaimsResponse>('/analytics/top-risk', { params: { n } });

export default api;