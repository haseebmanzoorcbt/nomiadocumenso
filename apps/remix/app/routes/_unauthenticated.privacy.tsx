import { Trans } from '@lingui/react/macro';

import { cn } from '@documenso/ui/lib/utils';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">
        <Trans>Privacy Policy</Trans>
      </h1>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Introduction</Trans>
          </h2>
          <p>
            <Trans>
              At Documenso, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our document signing platform.
            </Trans>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Information We Collect</Trans>
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <Trans>Personal information (name, email address, signature)</Trans>
            </li>
            <li>
              <Trans>Document information and signing history</Trans>
            </li>
            <li>
              <Trans>Usage data and analytics</Trans>
            </li>
            <li>
              <Trans>Device and browser information</Trans>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>How We Use Your Information</Trans>
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <Trans>To provide and maintain our service</Trans>
            </li>
            <li>
              <Trans>To notify you about changes to our service</Trans>
            </li>
            <li>
              <Trans>To provide customer support</Trans>
            </li>
            <li>
              <Trans>To monitor the usage of our service</Trans>
            </li>
            <li>
              <Trans>To detect, prevent and address technical issues</Trans>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Data Security</Trans>
          </h2>
          <p>
            <Trans>
              We implement appropriate security measures to protect your personal information. However,
              no method of transmission over the Internet is 100% secure, and we cannot guarantee
              absolute security.
            </Trans>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Your Rights</Trans>
          </h2>
          <p>
            <Trans>
              You have the right to access, correct, or delete your personal information. You can also
              object to our processing of your data and request data portability.
            </Trans>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Contact Us</Trans>
          </h2>
          <p>
            <Trans>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@documen.so" className="text-documenso-700 hover:underline">
                privacy@documen.so
              </a>
            </Trans>
          </p>
        </section>

        <section>
          <p className="text-sm text-gray-500">
            <Trans>Last updated: {new Date().toLocaleDateString()}</Trans>
          </p>
        </section>
      </div>
    </div>
  );
} 