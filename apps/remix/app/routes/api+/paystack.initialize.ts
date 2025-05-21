import type { ActionFunctionArgs } from 'react-router';
import { initializeTransaction } from "@documenso/lib/server-only/paystack";
import { prisma } from '@documenso/prisma';

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { email, amount, plan, callback_url } = await request.json();


    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId : user.id,
        status :'ACTIVE'
      }
    })

    if (subscription) {
      return new Response(
        JSON.stringify({success:true , error :'User already has active subscription.Please cancel it to change your subscription.'})
      )
    }


    if (!email || !plan) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing email or plan id' }),
        { status: 400 }
      );
    }

     
    

     
    
    const result = await initializeTransaction({
      email,
      amount,
      plan,
      callback_url,
    });

    if (!result.data) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to initialize transaction' }),
        { status: 500 }
      );
    }

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