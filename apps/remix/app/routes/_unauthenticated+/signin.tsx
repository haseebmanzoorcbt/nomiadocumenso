import { Trans } from '@lingui/react/macro';
import { Link, redirect } from 'react-router';

import { getOptionalSession } from '@documenso/auth/server/lib/utils/get-session';
import {
  IS_GOOGLE_SSO_ENABLED,
  IS_OIDC_SSO_ENABLED,
  OIDC_PROVIDER_LABEL,
} from '@documenso/lib/constants/auth';
import { env } from '@documenso/lib/utils/env';

import { SignInForm } from '~/components/forms/signin';
import { appMetaTags } from '~/utils/meta';

import type { Route } from './+types/signin';

export function meta() {
  return appMetaTags('Sign In');
}

export async function loader({ request }: Route.LoaderArgs) {
  const { isAuthenticated } = await getOptionalSession(request);

  // SSR env variables.
  const isGoogleSSOEnabled = IS_GOOGLE_SSO_ENABLED;
  const isOIDCSSOEnabled = IS_OIDC_SSO_ENABLED;
  const oidcProviderLabel = OIDC_PROVIDER_LABEL;

  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (email) {
    console.log('Email from query param:', email);
  }

  // if (isAuthenticated) {
  //   throw redirect('/documents');
  // }

  return {
    isGoogleSSOEnabled,
    isOIDCSSOEnabled,
    oidcProviderLabel,
    email,
  };
}

export default function SignIn({ loaderData }: Route.ComponentProps) {
  const { isGoogleSSOEnabled, isOIDCSSOEnabled, oidcProviderLabel, email } = loaderData;

  return (
    <div className="w-screen max-w-lg px-4">
      <div className="border-border bg-background z-10 rounded-xl border p-6">
        <div className="flex w-full items-center justify-center p-2">
          <img src="/images/nomiasignatures.png" className="h-20" />
        </div>
        <hr className="-mx-6 my-4" />
        <Trans>Nomia users are not allowed to Sign in</Trans>
        <br />
        <Trans>
          Please visit <a href="https://tapp.nomiadocs.com">Nomia Docs</a>
        </Trans>
      </div>
    </div>
  );
}
