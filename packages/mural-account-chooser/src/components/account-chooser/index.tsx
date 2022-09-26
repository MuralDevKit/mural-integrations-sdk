import { CircularProgress } from '@material-ui/core';
import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import styled from 'styled-components';
// @ts-ignore
import MuralLogo from '../../images/mural-logo.png';
import SignInWith3rdParty from './sign-in-with-3rd-party';
import {
  AccountStatus,
  AuthMode,
  getAuthMode,
  getMuralRealm,
} from '../../common/realm';

export const FONT_FAMILY = 'Proxima Nova, sans-serif';
export const PRIMARY_TEXT_COLOR = '#2f2f2f';
export const SECONDARY_TEXT_COLOR = '#757575';
export const MURAL_COLOR = '#e8005a';
export const BACKGROUND = '#f4f4f4';
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
  color: ${PRIMARY_TEXT_COLOR};
  background: ${BACKGROUND};
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

    // if (silent) return this.autoChoose(hintEmailSignIn, hintEmailSignUp);

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
    console.log('booogers');
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
        page: '3rd party',
      });
    } else {
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
    }
  };

  continueWith3rdParty = async () => {
    // What to do here? There's an auth url somewhere?
    return;
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
      <AccountChooserDiv theme={theme}>
        <MuralLogoImg src={MuralLogo} alt="MURAL" />
        {page === 'Sign in' ? (
          <AccountChooserContent>
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
              <VisitorButton onClick={visitor.onSelect}>
                Continue as a visitor
              </VisitorButton>
            )}
          </AccountChooserContent>
        ) : (
          // else the page === "Verify Email"
          <AccountChooserContent>
            <SignInWith3rdParty
              name={this.state.account?.authMode?.toString() ?? ''}
              signIn={this.continueWith3rdParty}
            />
          </AccountChooserContent>
        )}
        {hint && page === 'Sign in' && (
          <UseDifferentEmail>
            <NotYourEmail>Not {hint}?</NotYourEmail>
            <UseDifferentEmailLink onClick={this.useAnotherAccount}>
              Sign in with a different account
            </UseDifferentEmailLink>
          </UseDifferentEmail>
        )}
        <Footer />
      </AccountChooserDiv>
    );
  }
}
