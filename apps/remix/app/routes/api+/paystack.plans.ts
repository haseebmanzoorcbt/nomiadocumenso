import type { Route } from './+types/webhook.trigger';

const plans = [
  { name: 'EsignAnnual12000', amount: 6000000, interval: 'annually', plan_code: 'PLN_scnf05tt3rvui2i' },
  { name: 'EsignAnnual6000', amount: 3300000, interval: 'annually', plan_code: 'PLN_mok0xiw694rvm5l8' },
  { name: 'EsignAnnual2400', amount: 1440000, interval: 'annually', plan_code: 'PLN_knj6iur12pedilo' },
  { name: 'EsignAnnual1200', amount: 780000, interval: 'annually', plan_code: 'PLN_tzngz1lhbxvnufb' },
  { name: 'EsignAnnual1600', amount: 420000, interval: 'annually', plan_code: 'PLN_8kh731h1ojcx37d' },
  { name: 'EsignAnnual240', amount: 180000, interval: 'annually', plan_code: 'PLN_coac3n7m4jo59ct' },
  { name: 'EsignMonthly1000', amount: 600000, interval: 'monthly', plan_code: 'PLN_q4qbwireibc8qr5' },
  { name: 'EsignMonthly500', amount: 325000, interval: 'monthly', plan_code: 'PLN_27yc6xctga9huy7' },
  { name: 'EsignMonthly200', amount: 140000, interval: 'monthly', plan_code: 'PLN_0oqk4fijv5uais0' },
  { name: 'EsignMonthly100', amount: 75000, interval: 'monthly', plan_code: 'PLN_yvo5ujkxt1dliak' },
  { name: 'EsignMonthly50', amount: 40000, interval: 'monthly', plan_code: 'PLN_ze9llutx085dp9' },
  { name: 'EsignMonthly20', amount: 17000, interval: 'monthly', plan_code: 'PLN_1croxh14pyq4cj7' },
  { name: 'Esign1000', amount: 700000, interval: 'daily', plan_code: 'PLN_f54sm9jv38v7r5m' },
  { name: 'Esign500', amount: 375000, interval: 'daily', plan_code: 'PLN_5nmok9z1loz44u6' },
  { name: 'Esign200', amount: 160000, interval: 'daily', plan_code: 'PLN_kocqw02dow71g6c' },
  { name: 'Esign100', amount: 85000, interval: 'daily', plan_code: 'PLN_ktbomtrjkz73i1' },
  { name: 'Esign50', amount: 45000, interval: 'daily', plan_code: 'PLN_5996i1g3ply5r3s' },
  { name: 'Esign20', amount: 19000, interval: 'daily', plan_code: 'PLN_bitloy0ayiqpkdu' },
];

export async function loader() {
  return new Response(JSON.stringify({ plans }), { status: 200 });
} 