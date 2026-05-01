/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UserContext {
  age: number | null;
  location: string;
  isConfirmed: boolean;
  onboardingComplete: boolean;
}
