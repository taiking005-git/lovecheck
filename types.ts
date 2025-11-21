export interface User {
  uid: string;
  name: string;
  email: string;
  createdAt: number;
}

export interface Trait {
  id: string;
  name: string;
  description: string;
  verseReference: string; // e.g., "1 Cor 13:4"
  order: number;
}

export interface Rating {
  traitId: string;
  score: number; // 1-10
}

export interface EvaluatorResponse {
  id: string;
  evaluatorName: string;
  relationship: string;
  isAnonymous: boolean;
  ratings: Rating[];
  comment?: string;
  createdAt: number;
}

export interface EvaluationRequest {
  id: string;
  userId: string;
  token: string;
  label: string; // e.g. "Feedback from Family"
  allowAnonymous: boolean;
  active: boolean;
  createdAt: number;
  expiresAt: number;
  responses: EvaluatorResponse[];
}

export interface AggregatedScore {
  traitId: string;
  traitName: string;
  average: number;
  count: number;
  fullMark: number;
}