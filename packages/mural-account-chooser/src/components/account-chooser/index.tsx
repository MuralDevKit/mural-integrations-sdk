import { CircularProgress } from '@material-ui/core';
import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import styled from 'styled-components';
// @ts-ignore
import {
  AccountStatus,
  AuthMode,
  getAuthMode,
  getMuralRealm,
} from '../../common/realm';
// @ts-ignore
import GoogleIcon from '../../images/google-icon.png?w=32&h=32';
// @ts-ignore
import MicrosoftIcon from '../../images/microsoft-icon.png?w=32&h=32';
// @ts-ignore
import MuralIcon from '../../images/mural-icon.png?w=32&h=32';
// @ts-ignore
import MuralLogo from '../../images/mural-logo.png?w=130';
import SignUpWith3rdParty from './sign-up-with-3rd-party';

export const FONT_FAMILY = 'Proxima Nova, sans-serif';
export const MURAL_COLOR = '#e8005a';
export const MARGIN = '23px';

export const lightTheme = {
  primaryTextColor: '#2f2f2f',
  secondaryTextColor: '#4d4d4d',
  backgroundColor: '#f4f4f4',
  contentBackgroundColor: '#ffffff',
};

export const darkTheme = {
  primaryTextColor: '#f4f4f4',
  secondaryTextColor: '#d6d6d6',
  backgroundColor: '#1f1f1e',
  contentBackgroundColor: '#292929',
};

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;
const AccountChooserDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  color: ${({ theme }) => theme.primaryTextColor};
  background: ${({ theme }) => theme.backgroundColor};
`;
const MuralLogoImg = styled.img`
  height: 34px;
  margin: ${MARGIN} 0px ${MARGIN} 0px;
`;
const AccountChooserContent = styled.div`
  background-color: ${({ theme }) => theme.contentBackgroundColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 400px;
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
  width: 260px;
  height: 44px;
  font-family: ${FONT_FAMILY};
  font-weight: bold;
  font-size: 1em;
  margin: 15px;
`;
const EmailHintButton = styled(Button)`
  width: 100px;
  border: none;
  background: ${MURAL_COLOR};
  color: #ffffff;
`;
const SignInButton = styled(Button)`
  border: none;
  background: ${MURAL_COLOR};
  color: #ffffff;
`;
const VisitorButton = styled(Button)`
  border: 1px solid black;
  border-color: ${({ theme }) => theme.secondaryTextColor};
  width: 180px;
  color: ${({ theme }) => theme.secondaryTextColor};
  background: ${({ theme }) => theme.contentBackgroundColor};
`;
const UseDifferentEmail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const NotYourEmail = styled.div`
  font-family: ${FONT_FAMILY};
  color: ${({ theme }) => theme.primaryTextColor};
  font-size: 0.9em;
  line-height: 120%;
  margin-top: 5px;
`;
const UseDifferentEmailLink = styled.button`
  /* Button */
  cursor: pointer;
  background: none;
  padding: 0;
  border: none;
  border-bottom: 1px dashed ${({ theme }) => theme.primaryTextColor};

  /* Font */
  font-family: ${FONT_FAMILY};
  color: ${({ theme }) => theme.primaryTextColor};
  font-weight: bold;
  font-size: 0.9em;
  line-height: 120%;
`;
const Footer = styled.div`
  margin-bottom: ${MARGIN};
`;

interface AutomaticOptions {
  email: string;
  action: 'signin' | 'signup';
  consentSso?: boolean;
}

export interface AuthorizeParams {
  auto?: boolean | AutomaticOptions;
  signup?: boolean;
}

export enum ACCOUNT_CHOOSER_ACTION {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP',
  NEW_ACCOUNT = 'NEW_ACCOUNT',
  ANOTHER_ACCOUNT = 'ANOTHER_ACCOUNT',
}
export interface AccountChooserPropTypes {
  apiClient: ApiClient;
  hint?: string;
  getAuthUrl: (options?: AuthorizeParams) => Promise<string>;
  onSelection: (url: string, action?: ACCOUNT_CHOOSER_ACTION) => void;
  onError: (e: Error) => void;
  theme?: 'light' | 'dark';
  visitor?: { onSelect: () => void };
}

interface StateTypes {
  isLoading: boolean;
  account?: {
    email: string;
    authMode?: AuthMode;
    requireConsent?: boolean;
  };
  page: 'Sign in' | 'SSO Option';
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
    const { hint, visitor } = this.props;
    let account;

    // Go directly to the murally sign up page
    if (!hint && !visitor) await this.createNewAccount();

    if (hint) {
      const realm = await this.loadRealm(hint);
      if (realm) {
        const authMode = getAuthMode(realm);
        const accountExist =
          realm.accountStatus === AccountStatus.VALID ||
          realm.accountStatus === AccountStatus.UNVERIFIED;

        account = {
          email: hint,
          authMode,
          requireConsent: accountExist ? undefined : realm?.requireConsent,
        };
      }
    }

    this.setState({
      account,
      isLoading: false,
    });
  }

  loadRealm = async (email: string) => {
    const { apiClient } = this.props;
    try {
      return await getMuralRealm(apiClient, email);
    } catch (e: any) {
      this.props.onError(e);
      return null;
    }
  };

  createNewAccount = async () => {
    this.props.onSelection(
      await this.props.getAuthUrl({ signup: true }),
      ACCOUNT_CHOOSER_ACTION.NEW_ACCOUNT,
    );
  };

  useAnotherAccount = async () =>
    this.props.onSelection(
      await this.props.getAuthUrl(),
      ACCOUNT_CHOOSER_ACTION.ANOTHER_ACCOUNT,
    );

  continueWithEmail = async () => {
    const account = this.state.account;

    // The hint email is already associated with a mural account
    // so sign in
    if (account?.authMode === AuthMode.PASSWORD) {
      this.props.onSelection(
        await this.props.getAuthUrl({
          auto: {
            action: 'signin',
            email: this.props.hint!,
          },
        }),
        ACCOUNT_CHOOSER_ACTION.SIGN_IN,
      );
      return;
    }

    // The hint email is not a mural account yet, but it requires consent
    // from a thrid party like Google, Microsoft, or SSO.
    if (account?.requireConsent) {
      this.setState({
        page: 'SSO Option',
      });
      return;
    }

    // The hint email can be used to create a mural account
    this.props.onSelection(
      await this.props.getAuthUrl({
        auto: {
          action: 'signup',
          consentSso: false,
          email: this.props.hint!,
        },
      }),
      ACCOUNT_CHOOSER_ACTION.SIGN_UP,
    );
  };

  hintEmailSignUp = async () =>
    this.props.onSelection(
      await this.props.getAuthUrl({
        auto: {
          action: 'signup',
          consentSso: false,
          email: this.props.hint!,
        },
      }),
      ACCOUNT_CHOOSER_ACTION.SIGN_UP,
    );

  hintSsoSignUp = async () =>
    this.props.onSelection(
      await this.props.getAuthUrl({
        auto: {
          action: 'signup',
          consentSso: true,
          email: this.props.hint!,
        },
      }),
      ACCOUNT_CHOOSER_ACTION.SIGN_UP,
    );

  iconSrc = (): string => {
    const mode = this.state.account?.authMode;
    return mode === AuthMode.GOOGLE
      ? GoogleIcon
      : mode === AuthMode.MICROSOFT
      ? MicrosoftIcon
      : MuralIcon;
  };

  render() {
    const { theme, hint, visitor } = this.props;
    const { isLoading, page } = this.state;

    if (isLoading) {
      return (
        <Loading>
          <CircularProgress />
        </Loading>
      );
    }
    return (
      <AccountChooserDiv theme={theme === 'light' ? lightTheme : darkTheme}>
        <MuralLogoImg src={MuralLogo} alt="MURAL" />
        <AccountChooserContent
          theme={theme === 'light' ? lightTheme : darkTheme}
        >
          {page === 'Sign in' ? (
            <>
              <Header>Sign in to get started</Header>
              {hint ? (
                <EmailHintSignInDiv>
                  <Email>{hint}</Email>
                  <EmailHintButton
                    data-qa="continue-with-email"
                    onClick={this.continueWithEmail}
                  >
                    Continue
                  </EmailHintButton>
                </EmailHintSignInDiv>
              ) : (
                <SignInButton data-qa="sign-in" onClick={this.createNewAccount}>
                  Sign in
                </SignInButton>
              )}
              {visitor && (
                <VisitorButton
                  onClick={visitor.onSelect}
                  theme={theme === 'light' ? lightTheme : darkTheme}
                >
                  Continue as a visitor
                </VisitorButton>
              )}
            </>
          ) : (
            // else the page === "SSO Option"
            <>
              <SignUpWith3rdParty
                name={this.state.account?.authMode?.toString() ?? ''}
                iconSrc={this.iconSrc()}
                signUp={this.hintSsoSignUp}
                sendVerificationEmail={this.hintEmailSignUp}
                theme={theme === 'light' ? lightTheme : darkTheme}
              />
            </>
          )}
        </AccountChooserContent>
        {hint && page === 'Sign in' && (
          <UseDifferentEmail>
            <NotYourEmail>Not {hint}?</NotYourEmail>
            <UseDifferentEmailLink
              onClick={this.useAnotherAccount}
              theme={theme === 'light' ? lightTheme : darkTheme}
            >
              Sign in with a different account
            </UseDifferentEmailLink>
          </UseDifferentEmail>
        )}
        <Footer />
      </AccountChooserDiv>
    );
  }
}
