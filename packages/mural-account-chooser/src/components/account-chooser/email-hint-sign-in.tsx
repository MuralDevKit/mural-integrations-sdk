import * as React from 'react';
// import { MouseEventHandler } from 'react';
import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import styled from 'styled-components';

// @ts-ignore
import MuralIcon from '../../images/mural-icon.png?w=32&h=32';

export const FONT_FAMILY = 'Proxima Nova, sans-serif';
export const MURAL_COLOR = '#e8005a';

interface PropTypes {
  email: string;
  apiClient: ApiClient;
  onClick: () => void;
}

const EmailHintSignInDiv = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  border: #cccccc 1px solid;
  border-radius: 10px;
`;
const Email = styled.div`
  font-family: ${FONT_FAMILY};
  margin: 15px;
  padding: 0px 0px 0px 10px;
`;
const Button = styled.button`
  cursor: pointer;
  border-radius: 8px;
  width: 100px;
  height: 44px;
  font-family: ${FONT_FAMILY};
  font-weight: bold;
  font-size: 1em;
  margin: 15px;

  border: none;
  background: ${MURAL_COLOR};
  color: #ffffff;
`;

export default function EmailHintSignIn({ email, onClick }: PropTypes) {
  const signInWithThirdParty = () => {
    onClick(); // For now, tell the parent to change pages.
  };

  const signIn = () => {
    // What I think needs to happen.
    // if the email is already a mural account
    //    "sign in" via Murally
    //    DONE
    // else the user needs to create an account (aka - sign up)
    // call the api to see if the user needs to sign up with 3rd party/SSO
    // yes, then go to the sign-in-with-third-party page
    // no, then send the email address to the murally "create an account" page
  };

  return (
    <EmailHintSignInDiv>
      <Email>{email}</Email>
      <Button onClick={signInWithThirdParty}>Continue</Button>
    </EmailHintSignInDiv>
  );
}
