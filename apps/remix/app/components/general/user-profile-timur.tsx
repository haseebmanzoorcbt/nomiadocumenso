import { Trans } from '@lingui/react/macro';
import { File } from 'lucide-react';

import timurImage from '@documenso/assets/images/timur.png';
import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';
import { VerifiedIcon } from '@documenso/ui/icons/verified';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';

export type UserProfileTimurProps = {
  className?: string;
  rows?: number;
};

export const UserProfileTimur = ({ className, rows = 2 }: UserProfileTimurProps) => {
  const baseUrl = new URL(NEXT_PUBLIC_WEBAPP_URL() ?? 'http://localhost:3000');

  return (
    <div
      className={cn(
        'dark:bg-background flex flex-col items-center rounded-xl bg-neutral-100 p-4',
        className,
      )}
    >
      <div className="mt-4">
        <img src="/images/nomiasignatures.png" alt="nomia e-sign user profile" />
      </div>

      <div className="mt-8 w-full">
        <div className="dark:divide-foreground/30 dark:border-foreground/30 divide-y-2 divide-neutral-200 overflow-hidden rounded-lg border-2 border-neutral-200">
          <div className="text-muted-foreground dark:bg-foreground/20 bg-neutral-50 p-4 font-medium">
            <Trans>Documents</Trans>
          </div>

          {Array(rows)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="bg-background flex items-center justify-between gap-x-6 p-4"
              >
                <div className="flex items-center gap-x-2">
                  <File className="text-muted-foreground/80 h-8 w-8" strokeWidth={1.5} />

                  <div className="space-y-2">
                    <div className="dark:bg-foreground/30 h-1.5 w-24 rounded-full bg-neutral-300 md:w-36" />
                    <div className="dark:bg-foreground/20 h-1.5 w-16 rounded-full bg-neutral-200 md:w-24" />
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Button type="button" size="sm" className="pointer-events-none w-32">
                    <Trans>Sign</Trans>
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
