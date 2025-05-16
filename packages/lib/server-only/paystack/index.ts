import Paystack from 'paystack-api';

import { env } from '../../utils/env';



const paystack = Paystack("sk_test_be0b3cb028d5ea5cdf6aa15c2a60a9c9b453dba0");

export { paystack };

export async function initializeTransaction(options: {
  email: string;
  amount: number;
  plan?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}) {
  return paystack.transaction.initialize(options);
}

export async function verifyTransaction(reference: string) {
  return paystack.transaction.verify(reference);
} 