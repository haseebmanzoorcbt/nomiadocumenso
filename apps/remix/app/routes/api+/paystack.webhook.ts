import { prisma } from '@documenso/prisma';
import { PLAN_DOCUMENT_QUOTAS } from '@documenso/ee/server-only/limits/constants';

export async function action({ request }: { request: Request }){
  try {
    const event = await request.json();
    console.log('Paystack webhook received event:', JSON.stringify(event));
    if (event.event === 'subscription.create' || event.event === 'invoice.update') {
      const { customer, plan, subscription_code, next_payment_date } = event.data;
      console.log('Extracted from event:', { email: customer.email, plan, reference: subscription_code, next_payment_date });
      // Find user by email
      const user = await prisma.user.findUnique({ 
        where: { email: customer.email },
        include: {
          userCredits: {
            where: { isActive: true },
            orderBy: { lastUpdatedAt: 'desc' },
            take: 1
          }
        }
      });
      console.log('User lookup result:', user);
    
        if (user && plan?.plan_code) {
          try {
            const PAY_AS_YOU_GO_PLANS = [
              'PLN_f54sm9jv38v7r5m',
              'PLN_5nmok91ploz44u6', 
              'PLN_kxqcw02dow71g6c',
              'PLN_ktbomtrjkiz73i1',
              'PLN_59961ig3ply5r3s',
              'PLN_bit1oy0ayiqpkdu'
            ];

            const subscription = await prisma.subscription.create({
              data: {
                userId: user.id,
                planId: plan.plan_code,
                priceId: subscription_code,
                status: 'ACTIVE',
                periodEnd: PAY_AS_YOU_GO_PLANS.includes(plan.plan_code) ? null : next_payment_date,
              },
            });

            // Get existing credits
            const existingCredits = user.userCredits[0]?.credits ?? 0;
            // Get new plan credits
            const newPlanCredits = PLAN_DOCUMENT_QUOTAS[plan.plan_code] ?? 0;

            const userCredits = await prisma.userCredits.update({
              where: { id: user.userCredits[0]?.id },
              data: {
                credits: existingCredits + newPlanCredits,
              },
            });

            console.log('Subscription and credits created:', { subscription, userCredits });
          } catch (subError) {
            console.error('Error creating subscription:', subError);
          }
        } else {
          console.warn('User not found or plan_code missing:', { user, plan });
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
          data: { status: 'INACTIVE' , periodEnd: new Date() },
        });
      }
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Invalid webhook' }), { status: 400 });
  }
} 