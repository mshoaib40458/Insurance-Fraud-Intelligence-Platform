// API Types matching backend schemas

export interface ClaimInput {
  Month?: string;
  WeekOfMonth?: number;
  DayOfWeek?: string;
  Make?: string;
  AccidentArea?: string;
  DayOfWeekClaimed?: string;
  MonthClaimed?: string;
  WeekOfMonthClaimed?: number;
  Sex?: string;
  MaritalStatus?: string;
  Age?: number;
  Fault?: string;
  PolicyType?: string;
  VehicleCategory?: string;
  VehiclePrice?: string;
  PolicyNumber?: number | null;
  RepNumber?: number;
  Deductible?: number;
  DriverRating?: number;
  Days_Policy_Accident?: string;
  Days_Policy_Claim?: string;
  PastNumberOfClaims?: string;
  AgeOfVehicle?: string;
  AgeOfPolicyHolder?: string;
  PoliceReportFiled?: string;
  WitnessPresent?: string;
  AgentType?: string;
  NumberOfSuppliments?: string;
  AddressChange_Claim?: string;
  NumberOfCars?: string;
  Year?: number;
  BasePolicy?: string;
}

export interface RiskFactor {
  feature: string;
  shap_value: number;
  analyst_note: string;
}

export interface PredictionResponse {
  policy_number: number | null;
  fraud_probability: number;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  prediction: 0 | 1;
  top_risk_factors: RiskFactor[];
  top_protective_factors: RiskFactor[];
  model_version: string;
  model_name: string;
  threshold_used: number;
}

export interface ModelInfo {
  model_name: string;
  model_version: string;
  operational_threshold: number;
  risk_bands: Record<string, string>;
  brier_score_before: number;
  brier_score_after: number;
  claim_amount_in_dataset: boolean;
}

export interface ClaimsListResponse {
  total: number;
  page: number;
  page_size: number;
  pages: number;
  claims: ClaimRecord[];
}

export interface ClaimRecord {
  Claim_Index: number;
  PolicyNumber: number;
  Fraud_Probability: number;
  Risk_Level: 'Low' | 'Medium' | 'High';
  Prediction: 0 | 1;
  Actual_Fraud?: 0 | 1;
  [key: string]: unknown;
}

export interface ClaimDetail extends ClaimRecord {
  // Prediction fields from API
  fraud_probability: number;
  risk_score: number;
  prediction: 0 | 1;
  threshold_used: number;
  
  // SHAP explanation fields
  top_risk_factors: RiskFactor[];
  top_protective_factors: RiskFactor[];
  model_version: string;
  model_name: string;
  
  // All original claim features
  Month: string;
  WeekOfMonth: number;
  DayOfWeek: string;
  Make: string;
  AccidentArea: string;
  DayOfWeekClaimed: string;
  MonthClaimed: string;
  WeekOfMonthClaimed: number;
  Sex: string;
  MaritalStatus: string;
  Age: number;
  Fault: string;
  PolicyType: string;
  VehicleCategory: string;
  VehiclePrice: string;
  RepNumber: number;
  Deductible: number;
  DriverRating: number;
  Days_Policy_Accident: string;
  Days_Policy_Claim: string;
  PastNumberOfClaims: string;
  AgeOfVehicle: string;
  AgeOfPolicyHolder: string;
  PoliceReportFiled: string;
  WitnessPresent: string;
  AgentType: string;
  NumberOfSuppliments: string;
  AddressChange_Claim: string;
  NumberOfCars: string;
  Year: number;
  BasePolicy: string;
}

export interface AnalyticsSummary {
  total_claims: number;
  high_risk_claims: number;
  medium_risk_claims: number;
  low_risk_claims: number;
  avg_fraud_probability_pct: number;
  actual_fraud_count: number | null;
  actual_fraud_rate_pct: number | null;
  model_name: string;
  model_version: string;
  threshold: number;
}

export interface RiskDistribution {
  High: { count: number; percentage: number };
  Medium: { count: number; percentage: number };
  Low: { count: number; percentage: number };
}

export interface TopRiskClaimsResponse {
  claims: ClaimRecord[];
}

export interface ClaimsFilters {
  page?: number;
  page_size?: number;
  risk_level?: string;
  min_prob?: number;
  max_prob?: number;
  sort_by?: string;
  sort_desc?: boolean;
}