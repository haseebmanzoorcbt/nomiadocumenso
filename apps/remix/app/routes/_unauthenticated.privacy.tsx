import { Trans } from '@lingui/react/macro';

import { cn } from '@documenso/ui/lib/utils';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">
        <Trans>NOMIA PRIVACY POLICY</Trans>
      </h1>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <section className="mb-8">
          <p>
            <Trans>
              We respect your privacy and will protect your Personal Information. This Policy tells you how we, 
              Nomia Africa (Pty) Limited ("Nomia"), will process and protect your Personal Information. 
              In order for us to help you, you will have to share information with us. It is important that 
              you trust us to protect it and keep it confidential.
            </Trans>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>What Personal Information do we collect from you</Trans>
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <Trans>
                While you use this website and/or any metasites connected hereto (collectively "website") 
                we may collect your Personal Information or you may provide it to us (e.g. by signing up 
                for our "Free Trial" or subscribing for any of our services). This information may include 
                your name, company information and/or contact details;
              </Trans>
            </li>
            <li>
              <Trans>
                We may need to collect some financial information from you (e.g. credit card details) 
                required to process your monthly and/or annual payments for our services or products;
              </Trans>
            </li>
            <li>
              <Trans>
                We are required by law to verify the identity of our clients so we may ask you to provide 
                us with various other personal information.
              </Trans>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>How we may use your Personal Information</Trans>
          </h2>
          <p className="mb-4">
            <Trans>
              We may use your Personal Information to:
            </Trans>
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><Trans>respond to your enquires;</Trans></li>
            <li><Trans>send you a quote for any of our products or services;</Trans></li>
            <li><Trans>verify your identity;</Trans></li>
            <li><Trans>provide you access to any of our services or products;</Trans></li>
            <li><Trans>communicate with you regarding the services or products you have subscribed for;</Trans></li>
            <li><Trans>send you marketing material (including electronic communications) relating to any of our other services or products that you might be interested in.</Trans></li>
          </ul>
          <p className="mt-4 text-sm italic">
            <Trans>
              Note: You can unsubscribe from our marketing communications at any time by sending us an email 
              asking to unsubscribe, or by clicking on the "unsubscribe" link in any electronic marketing communications.
            </Trans>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Disclosure of Personal Information</Trans>
          </h2>
          <p className="mb-4">
            <Trans>
              We will not disclose your Personal Information to any third party except as provided for in this Policy. 
              Disclosure of your Personal Information to third parties shall only occur in the following instances:
            </Trans>
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <Trans>
                We may disclose or transfer your Personal Information to our agents and/or appointed service 
                providers for purposes of marketing our own products or services;
              </Trans>
            </li>
            <li>
              <Trans>
                We may disclose or transfer your Personal Information to suppliers, contractors, partners or 
                agents in order to provide you with access to our services or products;
              </Trans>
            </li>
            <li>
              <Trans>
                We may need to disclose your Personal Information to some of our employees who require such 
                information to perform their employment duties;
              </Trans>
            </li>
            <li>
              <Trans>
                We may need to disclose your Personal Information to applicable industry regulators and/or 
                other statutory bodies in terms of prevailing legislation.
              </Trans>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Protection of your Personal Information</Trans>
          </h2>
          <p className="mb-4">
            <Trans>
              We understand the value of your Personal Information and will therefore take all reasonable steps 
              to protect your Personal Information from loss, misuse or unauthorised alteration, access or 
              disclosure, by the following means:
            </Trans>
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <Trans>
                Your Personal Information is stored in databases that are protected by safeguards and firewalls 
                to ensure the privacy and confidentiality of your information;
              </Trans>
            </li>
            <li>
              <Trans>
                We use SSL Web Server Certificates to offer secure communications. At each point where 
                information is captured the secure padlock symbol will appear in your browser showing that 
                all communication is encrypted;
              </Trans>
            </li>
            <li>
              <Trans>
                We constantly monitor the latest internet developments to ensure our systems evolve as required. 
                We also test our systems regularly to ensure that our security mechanisms are up to date.
              </Trans>
            </li>
          </ul>
          <p className="mt-4 text-sm italic">
            <Trans>
              Notwithstanding the above, we do not make any warranties or representations that your Personal 
              Information or any of our services, products or website are 100% safe and secure nor do we 
              guarantee that our services, products or website is invulnerable to unauthorised access by third parties.
            </Trans>
          </p>
          <p className="mt-4">
            <Trans>
              Please note that the security of Personal Information that is transmitted through the internet or 
              via a mobile device can never be guaranteed. While we have taken all reasonable security steps, 
              we will not be held responsible for any interception or loss of Personal Information or 
              interruption of any communications through the internet.
            </Trans>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Third Party Links</Trans>
          </h2>
          <p className="mb-4">
            <Trans>
              Our website may contain links to third party or affiliate websites, or you may be directed to us 
              through a third-party website. If you follow a link to any of these websites, please note that 
              these websites have their own terms and privacy policies and that we do not accept any 
              responsibility or liability for them.
            </Trans>
          </p>
          <p>
            <Trans>
              We are not responsible for any representations, information, warranties or content on any website 
              of any third party or our affiliates. We do not exercise control over third parties' or our 
              affiliates' privacy policies and you should refer to the policy of any such third party or 
              affiliate to see how they protect your privacy.
            </Trans>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Cookies</Trans>
          </h2>
          <p className="mb-4">
            <Trans>
              We use cookies on this website (cookies are files that store information on your hard drive or 
              browser). This allows us to recognise that you have visited our website before and will make it 
              easier for you to maintain your preferences on the website and by seeing how you use the website, 
              we can tailor it around your preferences and measure usability of the website.
            </Trans>
          </p>
          <p className="mb-4">
            <Trans>
              You can, should you choose, disable the cookies from your browser and delete all cookies currently 
              stored on your computer. You can delete cookies at any time, or you can set your browser to reject 
              or disable cookies. If you do disable cookies some functions on the website may not work correctly.
            </Trans>
          </p>
          <p>
            <Trans>
              In addition to any Personal Information you may submit to us via the website, when visiting our 
              website, we may collect usage information which may include your geographical location and 
              information about the timing, frequency and pattern of your service use. This information may be 
              processed by us for purposes of analysing the use of our website and improving its usability.
            </Trans>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Trans>Changes to this Policy</Trans>
          </h2>
          <p className="mb-4">
            <Trans>
              We reserve the right to update this Policy from time to time for any of the following reasons:
            </Trans>
          </p>
          <p>
            <Trans>
              We will notify you of any changes by placing a notice in a prominent place on the website. If you 
              do not agree with the changes, then you must stop using the website and any of our products or 
              services. If you continue to use the website or any of our products or services following 
              notification of a change to the terms, the changed terms of this Policy will apply to you, and 
              you will be deemed to have accepted those updated terms.
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