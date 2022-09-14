import { CircularProgress } from '@material-ui/core';
import '@muraldevkit/mural-integrations-common/styles/fonts.css';
import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
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
import MuralLogo from '../../images/mural-logo.png?w=130';
import EmailHintSignIn from './email-hint-sign-in';
import './styles.scss';
import { AuthorizeParams } from './types';

const AUTH_MODE_ICONS = {
  [AuthMode.GOOGLE]: GoogleIcon,
  [AuthMode.MICROSOFT]: MicrosoftIcon,
  [AuthMode.ENTERPRISE_SSO]: null,
  [AuthMode.PASSWORD]: null,
};

export enum ACCOUNT_CHOOSER_ACTION {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP',
  NEW_ACCOUNT = 'NEW_ACCOUNT',
  ANOTHER_ACCOUNT = 'ANOTHER_ACCOUNT',
}

export interface AccountChooserPropTypes {
  apiClient: ApiClient;
  activeSession?: { email: string; avatar: string; onSelect: () => void };
  getAuthUrl: (options?: AuthorizeParams) => Promise<string>;
  hint?: string;
  onError: (e: Error) => void;
  onSelection: (url: string, action?: ACCOUNT_CHOOSER_ACTION) => void;
  // silent?: boolean;
  theme?: 'light' | 'dark';
  visitor?: { onSelect: () => void };
}

interface StateTypes {
  hintEmail?: {
    email: string;
    authMode?: AuthMode;
    requireConsent?: boolean;
  };
  isLoading: boolean;
  page: 'Sign in' | 'Verify email';
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
  }

  async componentDidMount() {
    let hintEmail;
    const { activeSession, hint } = this.props;

    if (hint && hint !== activeSession?.email) {
      const realm = await this.loadRealm(hint);
      if (realm) {
        const authMode = getAuthMode(realm);
        // const accountExist =
        //   realm.accountStatus === AccountStatus.VALID ||
        //   realm.accountStatus === AccountStatus.UNVERIFIED;

        hintEmail = {
          email: hint,
          authMode,
          requireConsent: realm?.requireConsent,
        };
      }
    }

    // I think this determines the action of the button?
    // if (silent) return this.autoChoose(hintEmailSignIn, hintEmailSignUp);

    this.setState({
      hintEmail,
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

  onSelection = (url: string, action?: ACCOUNT_CHOOSER_ACTION) => {
    this.props.onSelection(url, action);
  };

  hintEmailSignIn = async () =>
    this.onSelection(
      await this.props.getAuthUrl({
        auto: {
          action: 'signin',
          email: this.props.hint!,
        },
      }),
      ACCOUNT_CHOOSER_ACTION.SIGN_IN,
    );

  hintEmailSignUp = async () =>
    this.onSelection(
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
    this.onSelection(
      await this.props.getAuthUrl({
        auto: {
          action: 'signup',
          consentSso: true,
          email: this.props.hint!,
        },
      }),
      ACCOUNT_CHOOSER_ACTION.SIGN_UP,
    );

  useAnotherAccount = async () =>
    this.onSelection(
      await this.props.getAuthUrl(),
      ACCOUNT_CHOOSER_ACTION.ANOTHER_ACCOUNT,
    );

  createNewAccount = async () =>
    this.onSelection(
      await this.props.getAuthUrl({ signup: true }),
      ACCOUNT_CHOOSER_ACTION.NEW_ACCOUNT,
    );

  signInPage = (hint?: string) => {
    let button = hint ? (
      <EmailHintSignIn
        email={hint!}
        qa="sign-in-from-hint"
        onClick={this.verifyEmail}
      />
    ) : (
      <button
        data-qa="create-account"
        className="button mural-color-button"
        onClick={this.createNewAccount}
      >
        Sign in
      </button>
    );
    return button;
  };

  verifyEmail = () => {
    alert('Hey hey!');
    this.setState({
      page: 'Verify email',
    });
  };

  verifyEmailPage = (
    email?: string,
    authMode?: AuthMode,
    _requireConsent?: boolean,
  ) => {
    return (
      <div>
        <span className="notice">
          We noticed <b>{email}</b> is a {authMode} account
        </span>
        <button
          data-qa="sign-up-with"
          className="sign-up-with"
          onClick={this.hintSsoSignUp}
        >
          <img
            alt="auth-mode-icon"
            className="logo"
            src={AUTH_MODE_ICONS[authMode!]}
          />
          <div className="text">Sign up with {authMode}</div>
        </button>

        <div className="separator">
          <span>OR</span>
        </div>
      </div>
    );
  };

  render() {
    const { hint, theme, visitor } = this.props;
    const { hintEmail, isLoading, page } = this.state;

    if (isLoading) {
      return <CircularProgress />;
    }

    //if(!hint && !visitor) {
    // most basic page with only a sign in button -> ugly
    // go straight to Murally sign in page (which has a button to create account)
    //}

    return (
      <div data-qa="account-chooser" className={`account-chooser ${theme}`}>
        <div className="account-chooser-mural-logo">
          <img className="mural-logo" src={MuralLogo} alt="MURAL" />
        </div>
        {page === 'Sign in' ? (
          <div
            data-qa="account-chooser-content"
            className={`account-chooser-content ${theme}`}
          >
            <span className="header">Sign in to get started</span>
            {this.signInPage(hint)}
            {visitor && (
              <div className="button-group">
                <button
                  data-qa="continue-as-visitor"
                  className="button light-color-button visitor-button"
                  onClick={visitor.onSelect}
                >
                  Continue as a visitor
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            data-qa="account-chooser-content"
            className={`account-chooser-content ${theme}`}
          >
            <p>this.verifyEmailPage</p>
          </div>
        )}
        {hint && page == 'Sign in' && (
          <div className="account-chooser-footer">
            <div className="not-your-email">Not {hint}?</div>
            <button
              data-qa="use-another-account"
              className="link"
              onClick={this.useAnotherAccount}
            >
              Sign in with a different account
            </button>
          </div>
        )}
        <div className="footer"></div>
      </div>
    );
  }
}
