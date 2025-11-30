import { Trait } from './types';

export const CORE_TRAITS: Trait[] = [
  { id: 'patience', name: 'Patience', description: 'Is patient, suffering long without complaint.', verseReference: '13:4', order: 1 },
  { id: 'kindness', name: 'Kindness', description: 'Is kind, showing benevolence and helpfulness.', verseReference: '13:4', order: 2 },
  { id: 'no_envy', name: 'Contentment', description: 'Does not envy others.', verseReference: '13:4', order: 3 },
  { id: 'humility', name: 'Humility', description: 'Does not boast and is not proud.', verseReference: '13:4', order: 4 },
  { id: 'honor', name: 'Honor', description: 'Does not dishonor others.', verseReference: '13:5', order: 5 },
  { id: 'selflessness', name: 'Selflessness', description: 'Is not self-seeking.', verseReference: '13:5', order: 6 },
  { id: 'gentleness', name: 'Gentleness', description: 'Is not easily angered.', verseReference: '13:5', order: 7 },
  { id: 'forgiveness', name: 'Forgiveness', description: 'Keeps no record of wrongs.', verseReference: '13:5', order: 8 },
  { id: 'truth', name: 'Truthfulness', description: 'Does not delight in evil but rejoices with the truth.', verseReference: '13:6', order: 9 },
  { id: 'protection', name: 'Protection', description: 'Always protects.', verseReference: '13:7', order: 10 },
  { id: 'trust', name: 'Trust', description: 'Always trusts.', verseReference: '13:7', order: 11 },
  { id: 'hope', name: 'Hope', description: 'Always hopes.', verseReference: '13:7', order: 12 },
  { id: 'perseverance', name: 'Perseverance', description: 'Always perseveres.', verseReference: '13:7', order: 13 },
];

export const RELATIONSHIP_TYPES = [
  'Spouse',
  'Fiancé(e)',
  'Boyfriend/Girlfriend',
  'Parent',
  'Child',
  'Sibling',
  'Family Member',
  'Friend',
  'Best Friend',
  'Roommate',
  'Colleague/Coworker',
  'Manager/Boss',
  'Employee/Direct Report',
  'Mentor',
  'Mentee',
  'Pastor/Spiritual Leader',
  'Church Member',
  'Small Group Member',
  'Teacher/Professor',
  'Student',
  'Neighbor',
  'Other'
];

export const STORAGE_KEYS = {
  USERS: 'lovecheck_users',
  REQUESTS: 'lovecheck_requests',
  CURRENT_USER: 'lovecheck_current_user',
};