import { getSession } from '@documenso/auth/server/lib/utils/get-session';
import { getSubscriptionsByUserId } from '@documenso/lib/server-only/subscription/get-subscriptions-by-user-id';

export async function loader({ request }: { request: Request }) {
  try {
    const { user } = await getSession(request);

    if (!user?.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const subscriptions = await getSubscriptionsByUserId({
      userId: user.id,
    });

    return new Response(
      JSON.stringify({ success: true, data: subscriptions }),
      { status: 200 }
    );
  } catch (error) {
    console.error('[SUBSCRIPTIONS] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch subscriptions' }),
      { status: 500 }
    );
  }
} 