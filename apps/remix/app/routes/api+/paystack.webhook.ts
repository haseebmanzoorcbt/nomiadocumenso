import { prisma } from '@documenso/prisma';

export async function action({ request }: { request: Request }){
  try {
    const event = await request.json();
    console.log('Paystack webhook received event:', JSON.stringify(event));
    if (event.event === 'subscription.create' || event.event === 'invoice.update') {
      const { customer, plan, subscription_code } = event.data;
      console.log('Extracted from event:', { email: customer.email, plan, reference: subscription_code });
      // Find user by email
      const user = await prisma.user.findUnique({ where: { email: customer.email } });
      console.log('User lookup result:', user);
      if (event.event === 'subscription.create') {
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
      else
      {
        const user = await prisma.user.findUnique({ where: { email: customer.email } });
        if (user) {
          const existingSubscription = await prisma.subscription.findFirst({
            where: { priceId: subscription_code }
          });
          if (existingSubscription) {
            const subscription = await prisma.subscription.update({
              where: { id: existingSubscription.id },
              data: { status: 'ACTIVE', planId: plan.plan_code },
            });
          }
        }
      }
    } else if (event.event === 'subscription.disable') {
      const { subscription_code } = event.data;
      console.log('Processing subscription disable:', subscription_code);
      
      try {
        const existingSubscription = await prisma.subscription.findFirst({
          where: { priceId: subscription_code }
        });
        if (existingSubscription) {
          const subscription = await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: { status: 'INACTIVE' },
          });
          console.log('Subscription disabled:', subscription);
        }
      } catch (error) {
        console.error('Error disabling subscription:', error);
      }
    }
    else if (event.event === 'subscription.not_renew') {
      const { subscription_code } = event.data;
      console.log('Processing subscription update:', subscription_code);
      const existingSubscription = await prisma.subscription.findFirst({
        where: { priceId: subscription_code }
      });
      if (existingSubscription) {
        const subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: { status: 'INACTIVE' },
        });
      }
    }
    else if (event.event === 'invoice.payment_failed') {
      const { subscription_code } = event.data;
      console.log('Processing subscription update:', subscription_code);
      const existingSubscription = await prisma.subscription.findFirst({
        where: { priceId: subscription_code }
      });
      if (existingSubscription) {
        const subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: { status: 'INACTIVE' },
        });
      }
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Invalid webhook' }), { status: 400 });
  }
} 