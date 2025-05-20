import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button } from '@documenso/ui/primitives/button';
import { Card } from '@documenso/ui/primitives/card';
import { prisma } from '@documenso/prisma';
import { getServerSession } from '@documenso/lib/next-auth/get-server-session';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getServerSession(request);
  if (!session?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return json({
    subscription,
  });
}

export default function BillingPage() {
  const { subscription } = useLoaderData<typeof loader>();

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/paystack/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription?.priceId }),
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');

      window.location.reload();
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Billing Settings</h1>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
        
        {subscription ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium capitalize">{subscription.status.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-gray-600">Plan ID</p>
                <p className="font-medium">{subscription.planId}</p>
              </div>
              <div>
                <p className="text-gray-600">Created At</p>
                <p className="font-medium">
                  {new Date(subscription.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {subscription.status === 'ACTIVE' && (
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No active subscription</p>
            <Button
              onClick={() => window.location.href = '/pricing'}
            >
              View Plans
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        <p className="text-gray-600">Coming soon...</p>
      </Card>
    </div>
  );
} 