import type { TLimitsSchema } from './schema';

export const FREE_PLAN_LIMITS: TLimitsSchema = {
  documents: 10,
  recipients: 10,
  directTemplates: 3,
};

export const TEAM_PLAN_LIMITS: TLimitsSchema = {
  documents: Infinity,
  recipients: Infinity,
  directTemplates: Infinity,
};

export const SELFHOSTED_PLAN_LIMITS: TLimitsSchema = {
  documents: Infinity,
  recipients: Infinity,
  directTemplates: Infinity,
};

export const PLAN_DOCUMENT_QUOTAS: Record<string, number> = {
  PLN_scnf05tt3rvui2i: 12000, // EsignAnnual12000
  PLN_mok0xiw694rvm5l8: 6000,
  PLN_knj6iur12pedilo: 2400,
  PLN_tzngz1lhbxvnufb: 1200,
  PLN_8kh731h1ojcx37d: 600,
  PLN_coac3n7m4jo59ct: 240,
  PLN_q4qbwireibc8qr5: 1000,
  PLN_27yc6xctga9huy7: 500,
  PLN_0oqk4fijv5uais0: 200,
  PLN_yvo5ujkxt1dliak: 100,
  PLN_ze9llutx085dp9: 50,
  PLN_1croxh14pyq4cj7: 20,
  PLN_f54sm9jv38v7r5m: 1000,
  PLN_5nmok9z1loz44u6: 500,
  PLN_kocqw02dow71g6c: 200,
  PLN_ktbomtrjkiz73i1: 100,
  PLN_5996i1g3ply5r3s: 50,
  PLN_bit1oy0ayiqpkdu: 20,
};

export const DEFAULT_FREE_CREDITS = 10;