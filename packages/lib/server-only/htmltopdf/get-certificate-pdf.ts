import { DateTime } from 'luxon';
import type { Browser } from 'playwright';

import { NEXT_PUBLIC_WEBAPP_URL } from '../../constants/app';
import { type SupportedLanguageCodes, isValidLanguageCode } from '../../constants/i18n';
import { encryptSecondaryData } from '../crypto/encrypt';

export type GetCertificatePdfOptions = {
  documentId: number;
  language?: SupportedLanguageCodes | (string & {});
};

export const getCertificatePdf = async ({ documentId, language }: GetCertificatePdfOptions) => {
  const { chromium } = await import('playwright');

  const encryptedId = encryptSecondaryData({
    data: documentId.toString(),
    expiresAt: DateTime.now().plus({ minutes: 5 }).toJSDate().valueOf(),
  });

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
      ],
    });

    if (!browser) throw new Error('Failed to establish a browser');

    // Disable JS so we only use server-rendered HTML — avoids React hydration error #418 and page crash
    const browserContext = await browser.newContext({ javaScriptEnabled: false });
    console.log('Browser context created successfully');

    const page = await browserContext.newPage();

    const lang = isValidLanguageCode(language) ? language : 'en';
    console.log('Language set to:', lang);

    await page.context().addCookies([
      { name: 'language', value: lang, url: NEXT_PUBLIC_WEBAPP_URL() },
    ]);

    await page.goto(`${NEXT_PUBLIC_WEBAPP_URL()}/__htmltopdf/certificate?d=${encryptedId}`, {
      waitUntil: 'networkidle',
      timeout: 30_000, // extended timeout
    });

    console.log('Page loaded successfully');

    // Allow layout/fonts to settle before print
    await new Promise((r) => setTimeout(r, 500));
    console.log("printing pdf");
    const result = await page.pdf({
      format: 'A4',
    });
    console.log("pdf result:", result);

    console.log('PDF generated successfully');
    return result;
  } finally {
    if (browser) await browser.close();
  }
};