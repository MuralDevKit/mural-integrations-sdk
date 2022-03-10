import * as React from 'react';
import { MouseEventHandler } from 'react';

// @ts-ignore
import MuralIcon from '../../images/mural-icon.png?w=32&h=32';

interface PropTypes {
  avatar?: string;
  email: string;
  qa?: string;
  status: string;
  onClick: MouseEventHandler;
}

export default function AccountChoice({
  avatar,
  email,
  qa,
  status,
  onClick,
}: PropTypes) {
  return (
    <button className="account-choice" onClick={onClick} data-qa={qa}>
      <img className="avatar" src={avatar || MuralIcon} alt="avatar" />
      <div className="body">
        <div className="email">{email}</div>
        <div className="status">{status}</div>
      </div>
    </button>
  );
}
