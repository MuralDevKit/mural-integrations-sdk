import * as React from 'react';
import { MouseEventHandler } from 'react';

// @ts-ignore
import MuralIcon from '../../images/mural-icon.png?w=32&h=32';

interface PropTypes {
  email: string;
  qa?: string;
  onClick: MouseEventHandler;
}

export default function EmailHintSignIn({ email, qa, onClick }: PropTypes) {
  return (
    <div className="email-hint" data-qa={qa}>
      <div className="body">
        <div className="email">{email}</div>
        <button
          data-qa={qa}
          className="button mural-color-button"
          onClick={onClick}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
