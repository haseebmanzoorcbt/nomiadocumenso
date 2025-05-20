import { prisma } from '@documenso/prisma';
import { paystack } from '@documenso/lib/server-only/paystack';
import { manageSubscription } from '@documenso/lib/server-only/paystack';

export async function action({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const subscriptionCode = body.subscriptionCode;
    console.log(subscriptionCode);  

    if (!subscriptionCode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing subscription code' }),
        { status: 400 }
      );
    }

    // Verify the subscription exists and is active
    const subscription = await prisma.subscription.findFirst({
      where: {
        planId: subscriptionCode,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      return new Response(
        JSON.stringify({ success: false, error: 'Active subscription not found' }),
        { status: 404 }
      );
    }

    // Generate update subscription link from Paystack
    const result = await manageSubscription(subscriptionCode);

    if (!result.status) {
      return new Response(
        JSON.stringify({ success: false, error: result.message }),
        { status: 500 }
      );
    }

    // Type guard to check if result has data property
    if ('data' in result && result.data && 'link' in result.data) {
      return new Response(
        JSON.stringify({
          success: true,
          link: result.data.link,
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid response from Paystack' 
      }),
      { status: 500 }
    );
  } catch (error) {
    console.error('Error generating subscription update link:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to generate update link' }),
      { status: 500 }
    );
  }
} 