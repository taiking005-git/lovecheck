import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  arrayUnion
} from 'firebase/firestore';
import { db as firestore } from '../firebase';
import { User, EvaluationRequest, EvaluatorResponse, AggregatedScore } from '../types';
import { CORE_TRAITS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

export const db = {
  async getUserProfile(userId: string): Promise<User | null> {
    const docRef = doc(firestore, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  },

  async createRequest(userId: string, label: string, allowAnonymous: boolean): Promise<EvaluationRequest> {
    const id = uuidv4();
    const newRequest: EvaluationRequest = {
      id,
      userId,
      token: uuidv4(),
      label,
      allowAnonymous,
      active: true,
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      responses: []
    };

    await setDoc(doc(firestore, 'requests', id), newRequest);
    return newRequest;
  },

  async getUserRequests(userId: string): Promise<EvaluationRequest[]> {
    const q = query(collection(firestore, 'requests'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as EvaluationRequest);
  },

  async getRequestById(requestId: string): Promise<EvaluationRequest | null> {
    const docRef = doc(firestore, 'requests', requestId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as EvaluationRequest) : null;
  },

  async getPublicRequestInfo(requestId: string): Promise<{ request: EvaluationRequest, userName: string } | null> {
    const req = await this.getRequestById(requestId);
    if (!req) return null;

    // Fetch user name
    // The request object has the userId, so we use that to look up the user profile
    const user = await this.getUserProfile(req.userId);

    // If user profile is found, return the name, otherwise fallback to "User"
    return {
      request: req,
      userName: user ? user.name : "User"
    };
  },

  async submitEvaluation(requestId: string, response: EvaluatorResponse): Promise<void> {
    const docRef = doc(firestore, 'requests', requestId);
    await updateDoc(docRef, {
      responses: arrayUnion(response)
    });
  },

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