import { CircularProgress } from '@material-ui/core';
// import '@muraldevkit/mural-integrations-common/styles/fonts.css';
import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import styled from 'styled-components';
// @ts-ignore
import GoogleIcon from '../../images/google-icon.png?w=32&h=32';
// import {
//   // AccountStatus,
//   AuthMode,
//   // getAuthMode,
//   // getMuralRealm,
// } from '../../common/realm';
// @ts-ignore
// import GoogleIcon from '../../images/google-icon.png?w=32&h=32';
// @ts-ignore
// import MicrosoftIcon from '../../images/microsoft-icon.png?w=32&h=32';
// @ts-ignore
import MuralLogo from '../../images/mural-logo.png';
import EmailHintSignIn from './email-hint-sign-in';
import SignInWith3rdParty from './sign-in-with-3rd-party';
// import './styles.scss';
// import { AuthorizeParams } from './types';

export const FONT_FAMILY = 'Proxima Nova, sans-serif';
export const PRIMARY_TEXT_COLOR = '#2f2f2f';
export const SECONDARY_TEXT_COLOR = '#757575';
export const DARK_MODE_TEXT_COLOR = '#d0d0d0';
export const MURAL_COLOR = '#e8005a';
export const BACKGROUND = '#f4f4f4';
export const DARK_MODE_BACKGROUND = '#1f1f1f';
export const MARGIN = '34px';

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;
const AccountChooserDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${props =>
    props.theme === 'dark' ? DARK_MODE_TEXT_COLOR : PRIMARY_TEXT_COLOR};
  background: ${props =>
    props.theme === 'dark' ? DARK_MODE_BACKGROUND : BACKGROUND};
`;
const MuralLogoImg = styled.img`
  height: ${MARGIN};
  margin: ${MARGIN} 0px ${MARGIN} 0px;
`;
const AccountChooserContent = styled.div`
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 400px;
  background-color: white;
  border-radius: 10px;
  padding: 30px;
`;
const Header = styled.h1`
  margin: 20px;
  font-family: ${FONT_FAMILY};
  line-height: 100%;
  text-align: center;
  font-size: 2em;
  font-weight: bold;
`;
const Button = styled.button`
  cursor: pointer;
  border-radius: 8px;
  width: 260px;
  height: 44px;
  font-family: ${FONT_FAMILY};
  font-weight: bold;
  font-size: 1em;
  margin: 15px;
`;
const SignInButton = styled(Button)`
  border: none;
  background: ${MURAL_COLOR};
  color: #ffffff;
`;
const VisitorButton = styled(Button)`
  border: 1px solid black;
  border-color: ${SECONDARY_TEXT_COLOR};
  width: 180px;
  background: #ffffff;
`;
const UseDifferentEmail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: ${MARGIN};
`;
const NotYourEmail = styled.div`
  font-family: ${FONT_FAMILY};
  color: ${PRIMARY_TEXT_COLOR};
  font-size: 0.9em;
  line-height: 120%;
  margin: 10px;
`;
const UseDifferentEmailLink = styled.button`
  /* Button */
  cursor: pointer;
  background: none;
  padding: 0;
  border: none;
  border-bottom: 1px dashed ${PRIMARY_TEXT_COLOR};

  /* Font */
  font-family: ${FONT_FAMILY};
  color: ${PRIMARY_TEXT_COLOR};
  font-weight: bold;
  font-size: 0.9em;
  line-height: 120%;
`;
const Footer = styled.div`
  margin-bottom: ${MARGIN};
`;

export interface AccountChooserPropTypes {
  apiClient: ApiClient;
  hint?: string;
  onError: (e: Error) => void;
  theme?: 'light' | 'dark';
  visitor?: { onSelect: () => void };
}

interface StateTypes {
  isLoading: boolean;
  page: 'Sign in' | '3rd party';
}

export default class AccountChooser extends React.Component<
  AccountChooserPropTypes,
  StateTypes
> {
  constructor(props: AccountChooserPropTypes) {
    super(props);
    this.state = {
      isLoading: true,
      page: 'Sign in',
    };
    console.log(props.theme);
  }

  async componentDidMount() {
    this.setState({
      isLoading: false,
    });
  }

  signInWithThirdParty = () => {
    this.setState({
      page: '3rd party',
    });
  };

  render() {
    const { theme, hint, visitor, apiClient } = this.props;
    const { isLoading, page } = this.state;

    if (isLoading) {
      return (
        <Loading>
          <CircularProgress />
        </Loading>
      );
    }
    return (
      <AccountChooserDiv theme={theme}>
        <MuralLogoImg src={MuralLogo} alt="MURAL" />
        {page === 'Sign in' ? (
          <AccountChooserContent>
            <Header>Sign in to get started</Header>
            {hint ? (
              <EmailHintSignIn
                email={hint}
                apiClient={apiClient}
                onClick={this.signInWithThirdParty}
              />
            ) : (
              <SignInButton>Sign in</SignInButton>
            )}
            {visitor && <VisitorButton>Continue as a visitor</VisitorButton>}
          </AccountChooserContent>
        ) : (
          // page === "Verify Email"
          <AccountChooserContent>
            <SignInWith3rdParty
              name="Google"
              avatar={GoogleIcon}
              authUrl="www.google.com"
            />
          </AccountChooserContent>
        )}
        {hint && page === 'Sign in' &&
          <UseDifferentEmail>
            <NotYourEmail>Not {hint}?</NotYourEmail>
            <UseDifferentEmailLink>
              Sign in with a different account
            </UseDifferentEmailLink>
          </UseDifferentEmail>
        }
        <Footer />
      </AccountChooserDiv>
    );
  }
}
