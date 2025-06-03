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
  //Test Plans
  PLN_scnf05tt3vrui2i: 12000, // EsignAnnual12000
  PLN_moko1x694rvm5l8: 6000, // EsignAnnual6000   
  PLN_kn6j6ur12pedilo: 2400, // EsignAnnual2400
  PLN_tzngz1lbhvxnufb: 1200, // EsignAnnual1200
  PLN_8kh731h1ojcx37d: 600, // EsignAnnual600
  PLN_coac3n7m4jo59ct: 240, // EsignAnnual240 
  
  PLN_q4qbiwreibc8qr5: 1000, // EsignMonthly1000
  PLN_27yc6cxtga9huy7: 500, // EsignMonthly500 
  PLN_0oqk4fljy5uais0: 200, // EsignMonthly200
  PLN_yvo5ujkxt1diiak: 100, // EsignMonthly100 
  PLN_zel9llutx085dp9: 50, // EsignMonthly50
  PLN_1croxh14pyq4cj7: 20, // EsignMonthly20 

  PLN_f54sm9jv38v7r5m: 1000, // EsignMonthly1000
  PLN_5nmok91ploz44u6: 500, // EsignMonthly500 
  PLN_kxqcw02dow71g6c: 200, // EsignMonthly200
  PLN_ktbomtrjkiz73i1: 100, // EsignMonthly100 
  PLN_59961ig3ply5r3s: 50, // EsignMonthly50 
  PLN_bit1oy0ayiqpkdu: 20, // EsignMonthly20  




  //Live Plans

  PLN_60j0btaxtinfc7j: 12000, // EsignAnnual12000
  PLN_tdlrkbcuxy1w91v: 6000, //EsignAnnual6000
  PLN_lybvu4aaf5ry1jf: 2400, //EsignAnnual2400
  PLN_4od24fxbpa947cw: 1200, //EsignAnnual1200
  PLN_aq2fdnx8jpzxnuf: 600, //EsignAnnual600
  PLN_9xcixnz5a5kh14x: 240, //EsignAnnual240

  PLN_sat4vs3qy4btmjj: 1000, //EsignMonthly1000
  PLN_b3xu6wzwym77ifa: 500, //EsignMonthly500
  PLN_4lu7sf9rbtotr2n: 200, //EsignMonthly200
  PLN_hhfxiemem179vbl: 100, //EsignMonthly100
  PLN_m0iv4x08zo10128: 50, //EsignMonthly50
  PLN_4yptquhayqxdx68: 20, //EsignMonthly20

  PLN_aiohn8rtai2dtq1: 1000, //EsignMonthly1000
  PLN_9n7qj5gj3462buu: 500, //EsignMonthly500
  PLN_y1fcc9z6et50sx3: 200, //EsignMonthly200
  PLN_arl2oksyipcd4aq: 100, //EsignMonthly100
  PLN_jw0og1p6hc4oz9d: 50, //EsignMonthly50
  PLN_qcz1c2zdiyk3lw3: 20, //EsignMonthly20

};

export const DEFAULT_FREE_CREDITS = 10;