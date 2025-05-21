import { Trans } from '@lingui/react/macro';

import { cn } from '@documenso/ui/lib/utils';

export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">
        <Trans>Terms of Service</Trans>
      </h1>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Agreement to Terms</Trans>
          </h2>
          <p>
            <Trans>
              By accessing and using Documenso, you agree to be bound by these Terms of Service and all
              applicable laws and regulations. If you do not agree with any of these terms, you are
              prohibited from using or accessing this site.
            </Trans>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Use License</Trans>
          </h2>
          <p>
            <Trans>
              Permission is granted to temporarily use Documenso for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a transfer of title, and
              under this license you may not:
            </Trans>
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <Trans>Modify or copy the materials</Trans>
            </li>
            <li>
              <Trans>Use the materials for any commercial purpose</Trans>
            </li>
            <li>
              <Trans>Attempt to decompile or reverse engineer any software contained on Documenso</Trans>
            </li>
            <li>
              <Trans>Remove any copyright or other proprietary notations from the materials</Trans>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>User Responsibilities</Trans>
          </h2>
          <p>
            <Trans>
              As a user of Documenso, you are responsible for:
            </Trans>
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <Trans>Maintaining the confidentiality of your account</Trans>
            </li>
            <li>
              <Trans>All activities that occur under your account</Trans>
            </li>
            <li>
              <Trans>Ensuring your use of the service complies with all applicable laws</Trans>
            </li>
            <li>
              <Trans>Providing accurate and complete information</Trans>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Service Modifications</Trans>
          </h2>
          <p>
            <Trans>
              Documenso reserves the right to modify or discontinue, temporarily or permanently, the
              service with or without notice. We shall not be liable to you or any third party for any
              modification, suspension, or discontinuance of the service.
            </Trans>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Limitation of Liability</Trans>
          </h2>
          <p>
            <Trans>
              In no event shall Documenso be liable for any damages arising out of the use or inability
              to use the materials on our website, even if we have been notified of the possibility of
              such damage.
            </Trans>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Governing Law</Trans>
          </h2>
          <p>
            <Trans>
              These terms and conditions are governed by and construed in accordance with the laws and
              you irrevocably submit to the exclusive jurisdiction of the courts in that location.
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