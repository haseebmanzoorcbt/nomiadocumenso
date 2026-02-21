import { DateTime } from 'luxon';
import type { Browser } from 'playwright';

import { NEXT_PUBLIC_WEBAPP_URL } from '../../constants/app';
import { type SupportedLanguageCodes, isValidLanguageCode } from '../../constants/i18n';
import { env } from '../../utils/env';
import { encryptSecondaryData } from '../crypto/encrypt';

export type GetCertificatePdfOptions = {
  documentId: number;
  // eslint-disable-next-line @typescript-eslint/ban-types
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
    // const browserlessUrl = env('NEXT_PRIVATE_BROWSERLESS_URL');
    // if (browserlessUrl) {
    //   browser = await chromium.connectOverCDP(browserlessUrl);
    // } else {
    browser = await chromium.launch();
    // }

    if (!browser) {
      throw new Error(
        'Failed to establish a browser, please ensure you have either a Browserless.io url or chromium browser installed',
      );
    }

    const browserContext = await browser.newContext();
    console.log('Browser context created successfully');

    const page = await browserContext.newPage();

    const lang = isValidLanguageCode(language) ? language : 'en';
    console.log('Language set to:', lang);

    await page.context().addCookies([
      {
        name: 'language',
        value: lang,
        url: NEXT_PUBLIC_WEBAPP_URL(),
      },
    ]);

    await page.goto(`${NEXT_PUBLIC_WEBAPP_URL()}/__htmltopdf/certificate?d=${encryptedId}`, {
      waitUntil: 'networkidle',
      timeout: 10_000,
    });

    console.log('Page loaded successfully');

    // Allow layout/fonts to settle before printing (reduces "Printing failed" in headless)
    await new Promise((r) => setTimeout(r, 500));

    const result = await page.pdf({
      format: 'A4',
    });

    console.log('PDF generated successfully');
    return result;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
