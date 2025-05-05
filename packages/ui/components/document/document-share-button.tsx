import React, { useState } from 'react';
import { Button } from '../../primitives/button';

export type DocumentShareButtonProps = {
  token?: string;
  documentId: number;
};

export const DocumentShareButton = ({ token, documentId }: DocumentShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpenChange = (nextOpen: boolean) => setIsOpen(nextOpen);

  return (
    <div>
      <Button onClick={() => onOpenChange(true)} disabled={!documentId}>
        Share Signature Card
      </Button>

      {isOpen && (
        <div>
          <p>Thanks for using Nomia Signature!</p>
        </div>
      )}
    </div>
  );
};



