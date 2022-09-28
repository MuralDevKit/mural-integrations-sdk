import * as React from 'react';
import { MouseEventHandler } from 'react';
// @ts-ignore
import styled from 'styled-components';
import MuralIcon from '../../images/mural-icon.png?w=32&h=32';
import { lightTheme } from './index';

export const FONT_FAMILY = 'Proxima Nova, sans-serif';
const ThirdPartySignUp = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) => theme.primaryTextColor};
  border-color: ${({ theme }) => theme.secondaryTextColor};
  background: ${({ theme }) => theme.contentBackgroundColor};
`;
const Header = styled.h1`
  margin: 20px;
  font-family: ${FONT_FAMILY};
  line-height: 100%;
  text-align: center;
  font-size: 2em;
  font-weight: bold;
`;
const ThirdPartySignUpButton = styled.button`
  width: 70%;
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 1em;
  font-weight: bold;
  font-family: ${FONT_FAMILY};
  color: ${({ theme }) => theme.primaryTextColor};

  background: ${({ theme }) => theme.contentBackgroundColor};
  border: 1px solid;
  border-radius: 10px;
  padding: 10px;
`;
const Icon = styled.img`
  height: 32px;
`;
const Text = styled.div`
  font-family: ${FONT_FAMILY};
  color: ${({ theme }) => theme.secondaryTextColor};
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
  color: ${({ theme }) => theme.secondaryTextColor};

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
const SendVerificationEmail = styled.button`
  /* Button */
  cursor: pointer;
  background: none;
  padding: 0;
  margin: 10px;
  border: none;
  border-bottom: 1px dashed ${({ theme }) => theme.secondaryTextColor};

  /* Font */
  font-family: ${FONT_FAMILY};
  color: ${({ theme }) => theme.primaryTextColor};
  font-weight: bold;
  font-size: 0.9em;
  line-height: 120%;
`;

interface PropTypes {
  name: string;
  iconSrc?: string;
  signUp: MouseEventHandler;
  sendVerificationEmail?: MouseEventHandler;
  theme?: typeof lightTheme;
}

export default function SignUpWith3rdParty({
  name,
  iconSrc,
  signUp,
  sendVerificationEmail,
  theme,
}: PropTypes) {
  const icon = iconSrc ?? MuralIcon;

  return (
    <ThirdPartySignUp theme={theme}>
      <Header>Let's verify your email</Header>
      <ThirdPartySignUpButton
        onClick={signUp}
        data-qa="sign-in-3rd-party"
        theme={theme}
      >
        <Icon src={icon} alt="avatar" />
        <Text>Continue with {name}</Text>
      </ThirdPartySignUpButton>

      <Separator>or</Separator>
      <SendVerificationEmail
        onClick={sendVerificationEmail}
        data-qa="send-verification-email"
        theme={theme}
      >
        Send me a verification email
      </SendVerificationEmail>
    </ThirdPartySignUp>
  );
}
