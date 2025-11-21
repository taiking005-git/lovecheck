import { User, EvaluationRequest, EvaluatorResponse, AggregatedScore } from '../types';
import { CORE_TRAITS, STORAGE_KEYS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const db = {
  // Auth Simulation
  async login(email: string): Promise<User | null> {
    await delay(500);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find((u: User) => u.email === email);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },

  async register(name: string, email: string): Promise<User> {
    await delay(800);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

    if (users.find((u: User) => u.email === email)) {
      throw new Error("User already exists");
    }

    const newUser: User = {
      uid: uuidv4(),
      name,
      email,
      createdAt: Date.now(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  },

  getCurrentUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  async getUserProfile(userId: string): Promise<User | null> {
    await delay(300);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return users.find((u: User) => u.uid === userId) || null;
  },

  // Requests Logic
  async createRequest(userId: string, label: string, allowAnonymous: boolean): Promise<EvaluationRequest> {
    await delay(600);
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');

    const newRequest: EvaluationRequest = {
      id: uuidv4(),
      userId,
      token: uuidv4(), // Simulating a secure token
      label,
      allowAnonymous,
      active: true,
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      responses: []
    };

    requests.push(newRequest);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return newRequest;
  },

  async getUserRequests(userId: string): Promise<EvaluationRequest[]> {
    await delay(300);
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    return requests.filter((r: EvaluationRequest) => r.userId === userId);
  },

  async getRequestById(requestId: string): Promise<EvaluationRequest | null> {
    await delay(400);
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    return requests.find((r: EvaluationRequest) => r.id === requestId) || null;
  },

  async getPublicRequestInfo(requestId: string): Promise<{ request: EvaluationRequest, userName: string } | null> {
    await delay(400);
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    const req = requests.find((r: EvaluationRequest) => r.id === requestId);

    if (!req) return null;

    // Join user data
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find((u: User) => u.uid === req.userId);

    return user ? { request: req, userName: user.name } : null;
  },

  async submitEvaluation(requestId: string, response: EvaluatorResponse): Promise<void> {
    await delay(1000);
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    const index = requests.findIndex((r: EvaluationRequest) => r.id === requestId);

    if (index === -1) throw new Error("Request not found");

    requests[index].responses.push(response);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  },

  // Aggregation Logic
  calculateAggregates(responses: EvaluatorResponse[]): AggregatedScore[] {
    if (responses.length === 0) {
      return CORE_TRAITS.map(trait => ({
        traitId: trait.id,
        traitName: trait.name,
        average: 0,
        count: 0,
        fullMark: 10
      }));
    }

    return CORE_TRAITS.map(trait => {
      let totalScore = 0;
      let count = 0;

      responses.forEach(response => {
        const rating = response.ratings.find(r => r.traitId === trait.id);
        if (rating) {
          totalScore += rating.score;
          count++;
        }
      });

      return {
        traitId: trait.id,
        traitName: trait.name,
        average: count > 0 ? parseFloat((totalScore / count).toFixed(1)) : 0,
        count,
        fullMark: 10
      };
    });
  }
};