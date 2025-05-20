import { prisma } from '@documenso/prisma';
import { paystack } from '@documenso/lib/server-only/paystack';
import { manageSubscription } from '@documenso/lib/server-only/paystack';

export async function action({ request }: { request: Request }) {
  console.log('API endpoint called');
  try {
    console.log('Parsing request body...');
    const body = await request.json();
    console.log('Request body:', body);
    
    const subscriptionCode = body.subscriptionCode;
    console.log('Subscription code:', subscriptionCode);

    if (!subscriptionCode) {
      console.log('Missing subscription code');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing subscription code' }),
        { status: 400 }
      );
    }

    console.log('Looking up subscription in database...');
    // Verify the subscription exists and is active
    const subscription = await prisma.subscription.findFirst({
      where: {
        priceId: subscriptionCode,
        status: 'ACTIVE',
      },
    });
    console.log('Database query result:', subscription);

    if (!subscription) {
      console.log('Active subscription not found');
      return new Response(
        JSON.stringify({ success: false, error: 'Active subscription not found' }),
        { status: 404 }
      );
    }

    console.log('Calling Paystack API...');
    // Generate update subscription link from Paystack
    const result = await manageSubscription(subscriptionCode);
    console.log('Paystack API response:', result);

    if (!result.status) {
      console.log('Paystack API error:', result.message);
      return new Response(
        JSON.stringify({ success: false, error: result.message }),
        { status: 500 }
      );
    }

    // Type guard to check if result has data property
    if ('data' in result && result.data && 'link' in result.data) {
      console.log('Successfully generated link:', result.data.link);
      return new Response(
        JSON.stringify({
          success: true,
          link: result.data.link,
        }),
        { status: 200 }
      );
    }

    console.log('Invalid Paystack response structure');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid response from Paystack' 
      }),
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in API endpoint:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to generate update link' }),
      { status: 500 }
    );
  }
} 