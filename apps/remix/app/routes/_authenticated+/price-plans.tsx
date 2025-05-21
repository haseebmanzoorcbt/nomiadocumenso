import { useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { Link } from 'react-router';

import { useSession } from '@documenso/lib/client-only/providers/session';
import { Button } from '@documenso/ui/primitives/button';

import { E_SIGN_BASE_URL } from '~/utils/config';
import { appMetaTags } from '~/utils/meta';

const plansData = {
  'Pay-as-you-go': [
    { name: '20 credits', credits: 20, amount: 'ZAR 190', planCode: 'PLN_bit1oy0ayiqpkdu' },
    { name: '50 credits', credits: 50, amount: 'ZAR 450', planCode: 'PLN_59961ig3ply5r3s' },
    { name: '100 credits', credits: 100, amount: 'ZAR 850', planCode: 'PLN_ktbomtrjkiz73i1' },
    { name: '200 credits', credits: 200, amount: 'ZAR 1,600', planCode: 'PLN_kxqcw02dow71g6c' },
    { name: '500 credits', credits: 500, amount: 'ZAR 3,750', planCode: 'PLN_5nmok91ploz44u6' },
    { name: '1000 credits', credits: 1000, amount: 'ZAR 7,000', planCode: 'PLN_f54sm9jv38v7r5m' },
  ],
  Monthly: [
    { name: '20 credits', credits: 20, amount: 'ZAR 170', planCode: 'PLN_1croxh14pyq4cj7' },
    { name: '50 credits', credits: 50, amount: 'ZAR 400', planCode: 'PLN_zel9llutx085dp9' },
    { name: '100 credits', credits: 100, amount: 'ZAR 750', planCode: 'PLN_yvo5ujkxt1diiak' },
    { name: '200 credits', credits: 200, amount: 'ZAR 1,400', planCode: 'PLN_0oqk4fljy5uais0' },
    { name: '500 credits', credits: 500, amount: 'ZAR 3,250', planCode: 'PLN_27yc6cxtga9huy7' },
    { name: '1000 credits', credits: 1000, amount: 'ZAR 6,000', planCode: 'PLN_q4qbiwreibc8qr5' },
  ],
  Annually: [
    { name: '240 credits', credits: 240, amount: 'ZAR 1,800', planCode: 'PLN_coac3n7m4jo59ct' },
    { name: '600 credits', credits: 600, amount: 'ZAR 4,200', planCode: 'PLN_8kh731h1ojcx37d' },
    { name: '1200 credits', credits: 1200, amount: 'ZAR 7,800', planCode: 'PLN_tzngz1lbhvxnufb' },
    { name: '2400 credits', credits: 2400, amount: 'ZAR 14,400', planCode: 'PLN_kn6j6ur12pedilo' },
    { name: '6000 credits', credits: 6000, amount: 'ZAR 33,000', planCode: 'PLN_moko1x694rvm5l8' },
    {
      name: '12000 credits',
      credits: 12000,
      amount: 'ZAR 60,000',
      planCode: 'PLN_scnf05tt3vrui2i',
    },
  ],
};

async function handleApiPaystack(
  email: string,
  amount: number,
  planId: string,
  reference: null | string = '',
  callback_url: null | string = '',
) {
  const response = await fetch(`${E_SIGN_BASE_URL}/api/paystack/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount,
      plan: planId,
      reference: reference,
      callback_url: callback_url,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log('API ERROR', errorData?.message);
  }

  const data = await response.json();
  console.log('API PAYSTACK DATA', data);
  return data;
}

function PlanCard({ title, plans, user }: { title: string | any; plans: any; user: any }) {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  return (
    <div className="flex h-[70vh] w-full flex-col justify-between rounded-xl border p-4 hover:bg-purple-50 md:w-1/3">
      <div className="max-h-32">
        <h2 className="mb-4 text-xl font-semibold">{title}</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {plans.map((plan: any) => (
            <button
              key={plan.name}
              onClick={() => setSelectedPlan(plan)}
              className={`rounded-md border px-3 py-1 text-sm ${
                selectedPlan.name === plan.name ? 'bg-primary text-white' : 'hover:bg-muted'
              }`}
            >
              {plan.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-muted-foreground mb-4 text-center text-xl font-bold">
          <Trans>Credits</Trans> <br />{' '}
          <strong className="text-primary text-2xl">{selectedPlan.credits}</strong>
        </div>

        <div className="text-muted-foreground mb-4 text-center text-xl font-bold">
          <Trans>Starts at </Trans> <br />{' '}
          <strong className="text-primary text-2xl">{selectedPlan.amount}</strong>
        </div>
      </div>
      <Link
        to="/signin"
        className="text-primary bottom-0 w-full text-sm underline duration-200 hover:opacity-70"
      >
        <Button
          className="w-full"
          onClick={() => {
            handleApiPaystack(user?.email, 100, selectedPlan.planCode);
          }}
        >
          <Trans>Proceed with this plan</Trans>
        </Button>
      </Link>
    </div>
  );
}

export function meta() {
  return appMetaTags('Price Plans');
}

export default function PricePlansPage() {
  const { user } = useSession();

  return (
    <div className="bg-re mx-auto w-full max-w-screen-xl px-4 md:px-8">
      <div className="w-full">
        <h1 className="text-3xl font-semibold">
          <Trans>Please select plan as you like</Trans>
        </h1>

        <div className="mt-6 flex flex-col gap-4 md:flex-row">
          {Object.entries(plansData).map(([interval, plans]) => (
            <PlanCard key={interval} title={interval} plans={plans} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
}
