// @ts-ignore
import GoogleIcon from '@muraldevkit/mural-integrations-common/assets/brands/google-icon.png?w=32&h=32';
// @ts-ignore
import MicrosoftIcon from '@muraldevkit/mural-integrations-common/assets/brands/microsoft-icon.png?w=32&h=32';
import { ReactComponent as MuralIcon } from '@muraldevkit/mural-integrations-common/assets/brands/mural-symbol.svg';
import * as React from 'react';
import { MouseEventHandler } from 'react';
import styled from 'styled-components';
import { AuthMode } from '../../common/realm';
import { FONT_FAMILY } from './styles';

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
  cursor: pointer;
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

const AUTH_MODE_ICONS = {
  [AuthMode.GOOGLE]: <Icon src={GoogleIcon} />,
  [AuthMode.MICROSOFT]: <Icon src={MicrosoftIcon} />,
  [AuthMode.ENTERPRISE_SSO]: null,
  [AuthMode.PASSWORD]: (
    <Icon>
      <MuralIcon />
    </Icon>
  ),
};

interface PropTypes {
  authMode: AuthMode;
  name: string;
  signUp: MouseEventHandler;
  sendVerificationEmail?: MouseEventHandler;
  theme?: {
    primaryTextColor: string;
    secondaryTextColor: string;
    backgroundColor: string;
    contentBackgroundColor: string;
  };
}

const SignUpWith3rdParty: React.FC<PropTypes> = (props: PropTypes) => {
  const { name, authMode, signUp, sendVerificationEmail, theme } = props;

  return (
    <ThirdPartySignUp theme={theme}>
      <Header>Let's verify your email</Header>
      <ThirdPartySignUpButton
        onClick={signUp}
        data-qa="sign-up-with"
        theme={theme}
      >
        {AUTH_MODE_ICONS[authMode]}
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
};

export default SignUpWith3rdParty;
