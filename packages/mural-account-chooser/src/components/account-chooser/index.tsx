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

export interface AccountChooserPropTypes {
  apiClient: ApiClient;
  activeSession?: { email: string; avatar: string; onSelect: () => void };
  getAuthUrl: (options?: AuthorizeParams) => Promise<string>;
  hint?: string;
  onError: (e: Error) => void;
  onSelection: (url: string, action?: ACCOUNT_CHOOSER_ACTION) => void;
  silent?: boolean;
  theme?: 'light' | 'dark';
  visitor?: { onSelect: () => void };
}

interface StateTypes {
  hintEmail?: {
    email: string;
    authMode?: AuthMode;
    requireConsent?: boolean;
  };
  hintEmailSignIn?: {
    email: string;
    authMode?: AuthMode;
  };
  hintEmailSignUp?: {
    email: string;
    authMode?: AuthMode;
    requireConsent?: boolean;
  };
  isLoading: boolean;
}

export enum ACCOUNT_CHOOSER_ACTION {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP',
  NEW_ACCOUNT = 'NEW_ACCOUNT',
  ANOTHER_ACCOUNT = 'ANOTHER_ACCOUNT',
}

export default class AccountChooser extends React.Component<
  AccountChooserPropTypes,
  StateTypes
> {
  constructor(props: AccountChooserPropTypes) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  async componentDidMount() {
    let hintEmail;
    let hintEmailSignIn;
    let hintEmailSignUp;
    const { activeSession, hint, silent } = this.props;

    if (hint && hint !== activeSession?.email) {
      const realm = await this.loadRealm(hint);
      if (realm) {
        const authMode = getAuthMode(realm);
        const accountExist =
          realm.accountStatus === AccountStatus.VALID ||
          realm.accountStatus === AccountStatus.UNVERIFIED;

        hintEmail = {
          email: hint,
          authMode,
          requireConsent: realm?.requireConsent,
        };

        if (accountExist) {
          hintEmailSignIn = { email: hint, authMode };
        } else {
          hintEmailSignUp = {
            email: hint,
            authMode,
            requireConsent: realm?.requireConsent,
          };
        }
      }
    }

    // I think this determines the action of the button?
    if (silent) return this.autoChoose(hintEmailSignIn, hintEmailSignUp);

    this.setState({
      hintEmail,
      hintEmailSignIn,
      hintEmailSignUp,
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

  autoChoose = (
    hintEmailSignIn: StateTypes['hintEmailSignIn'],
    hintEmailSignUp: StateTypes['hintEmailSignUp'],
  ) => {
    const { activeSession } = this.props;
    if (activeSession) return activeSession.onSelect();
    if (hintEmailSignIn) return this.hintEmailSignIn();
    if (hintEmailSignUp) {
      if (hintEmailSignUp.requireConsent) return this.hintSsoSignUp();
      return this.hintEmailSignUp();
    }
    return this.useAnotherAccount();
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

  render() {
    const { hint, theme, visitor } = this.props;
    const { hintEmail, isLoading } = this.state;

    if (isLoading) {
      return <CircularProgress />;
    }

    //if(!hint && !visitor) {
    // most basic page with only a sign in button -> ugly
    // go straight to Murally sign in page (which has a button to create account)
    //}

    if (!hint) {
      return (
        <div data-qa="account-chooser" className={`account-chooser ${theme}`}>
          <span className="header">Sign in to get started</span>

          <div className="content">
            <button
              data-qa="create-account"
              className="button mural-color-button"
              onClick={this.createNewAccount}
            >
              Sign in
            </button>

            {visitor && <div className="separator" />}

            {visitor && (
              <div className="button-group">
                <div>
                  <button
                    data-qa="continue-as-visitor"
                    className="button light-color-button"
                    onClick={visitor.onSelect}
                  >
                    Continue as visitor
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="footer">
            <img className="mural-logo" src={MuralLogo} alt="Mural logo" />
          </div>
        </div>
      );
    }

    return (
      <div data-qa="account-chooser" className={`account-chooser ${theme}`}>
        <div className="footer">
          <img className="mural-logo" src={MuralLogo} alt="Mural logo" />
        </div>
        <span className="header">Sign in to get started</span>

        {hintEmail && (
          <EmailHintSignIn
            email={hint!}
            qa="sign-in-from-hint"
            onClick={this.hintEmailSignIn}
          />
        )}

        <div className="content">
          <div className="button-group">
            {visitor && (
              <div>
                <button
                  data-qa="continue-as-visitor"
                  className="button light-color-button"
                  onClick={visitor.onSelect}
                >
                  Continue as visitor
                </button>
              </div>
            )}
          </div>
          <div className="separator" />
          <div>Not {hint}?</div>
          <button
            data-qa="use-another-account"
            className="link"
            onClick={this.useAnotherAccount}
          >
            Sign in with a different account
          </button>
        </div>
      </div>
    );
  }
}
