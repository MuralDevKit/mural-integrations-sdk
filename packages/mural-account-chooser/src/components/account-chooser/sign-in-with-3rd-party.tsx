import * as React from 'react';
// import { MouseEventHandler } from 'react';
// @ts-ignore
import GoogleIcon from '../../images/google-icon.png?w=32&h=32';
// @ts-ignore
import MicrosoftIcon from '../../images/microsoft-icon.png?w=32&h=32';
// @ts-ignore
import MuralIcon from '../../images/mural-logo.png?w=32&h=32';

import styled from 'styled-components';

export const FONT_FAMILY = 'Proxima Nova, sans-serif';
export const PRIMARY_TEXT_COLOR = '#2f2f2f';
const ThirdPartySignIn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Header = styled.h1`
  margin: 20px;
  font-family: ${FONT_FAMILY};
  line-height: 100%;
  text-align: center;
  font-size: 2em;
  font-weight: bold;
`;
const ThirdPartySignInButton = styled.button`
  width: 70%;
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 0.9em;
  font-weight: bold;

  border: #cccccc 1px solid;
  border-radius: 10px;
  background: white;
  padding: 10px;
`;
const Avatar = styled.img`
  height: 32px;
`;
const Text = styled.div`
  font-family: ${FONT_FAMILY};
  margin: 10px;
`;
const Separator = styled.div`
  /* Size / Position */
  position: relative;
  width: 260px;
  margin: 20px;

  /* Other */
  text-align: center;
  font-family: ${FONT_FAMILY};

  &:before {
    content: '';
    display: inline-block;
    width: 50%;
    margin: 0 0.5em 0 -55%;
    vertical-align: middle;
    border-bottom: 1px solid;
  }

  &:after {
    content: '';
    display: inline-block;
    width: 50%;
    margin: 0 0.5em 0 -55%;
    vertical-align: middle;
    border-bottom: 1px solid;
    margin: 0 -55% 0 0.5em;
  }
`;
// const Line = styled.hr`
//   border-top: 3px solid ${PRIMARY_TEXT_COLOR};
// `;
const SendVerificationEmail = styled.button`
  /* Button */
  cursor: pointer;
  background: none;
  padding: 0;
  margin: 10px;
  border: none;
  border-bottom: 1px dashed ${PRIMARY_TEXT_COLOR};

  /* Font */
  font-family: ${FONT_FAMILY};
  color: ${PRIMARY_TEXT_COLOR};
  font-weight: bold;
  font-size: 0.9em;
  line-height: 120%;
`;

interface PropTypes {
  name: string;
  avatar?: string;
  authUrl: string;
}

export default function SignInWith3rdParty({
  name,
  avatar,
  authUrl, // TODO: When the user clicks the button, go to the auth url
}: PropTypes) {
  return (
    <ThirdPartySignIn>
      <Header>Let's verify your email</Header>
      <ThirdPartySignInButton>
        <Avatar src={avatar || MuralIcon} alt="avatar" />
        <Text>Continue with {name}</Text>
      </ThirdPartySignInButton>
      <Separator>or</Separator>
      <SendVerificationEmail>
        Send me a verification email
      </SendVerificationEmail>
    </ThirdPartySignIn>
  );
}
