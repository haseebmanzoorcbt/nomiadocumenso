import { prisma } from '@documenso/prisma';

export async function action({ request }: { request: Request }){
  try {
    const event = await request.json();
    console.log('Paystack webhook received event:', JSON.stringify(event));
    if (event.event === 'subscription.create') {
      const { customer, plan, subscription_code } = event.data;
      console.log('Extracted from event:', { email: customer.email, plan, reference: subscription_code });
      // Find user by email
      const user = await prisma.user.findUnique({ where: { email: customer.email } });
      console.log('User lookup result:', user);
      if (user && plan?.plan_code) {
        try {
          const subscription = await prisma.subscription.create({
            data: {
              userId: user.id,
              planId: plan.plan_code,
              priceId: subscription_code,
              status: 'ACTIVE',
            },
          });
          console.log('Subscription created:', subscription);
        } catch (subError) {
          console.error('Error creating subscription:', subError);
        }
      } else {
        console.warn('User not found or plan_code missing:', { user, plan });
      }
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Invalid webhook' }), { status: 400 });
  }
} 