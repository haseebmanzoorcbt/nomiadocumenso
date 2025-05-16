import { initializeTransaction } from '@documenso/lib/server-only/paystack';
import type { Route } from './+types/webhook.trigger';

export async function action({ request }: Route.ActionArgs) {
  try {
    const { email, amount, plan, callback_url } = await request.json();
    if (!email || !amount) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing email or amount' }),
        { status: 400 }
      );
    }
    const result = await initializeTransaction({
      email,
      amount,
      plan,
      callback_url,
    });
    return new Response(
      JSON.stringify({
        success: true,
        authorization_url: result.data.authorization_url,
        reference: result.data.reference,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Paystack initialize error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to initialize transaction' }),
      { status: 500 }
    );
  }
} 