import * as React from 'react';
import { MouseEventHandler } from 'react';

// @ts-ignore
import MuralIcon from '../../images/mural-icon.png';

interface PropTypes {
  avatar?: string;
  email: string;
  status: string;
  onClick: MouseEventHandler;
}

export default function AccountChoice({
  avatar,
  email,
  status,
  onClick,
}: PropTypes) {
  return (
    <button className="account-choice" onClick={onClick}>
      <img className="avatar" src={avatar || MuralIcon} alt="avatar" />
      <div className="email">{email}</div>
      <div className="status">{status}</div>
    </button>
  );
}
