import { CircularProgress } from '@material-ui/core';
import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import {
  AccountStatus,
  AuthMode,
  getAuthMode,
  getMuralRealm,
} from '../../common/realm';
import AccountChoice from './account-choice';
import './styles.scss';
import { AuthorizeParams } from './types';

// @ts-ignore
import MuralLogo from '../../images/mural-logo.png?w=130';
// @ts-ignore
import GoogleIcon from '../../images/google-icon.png?w=32&h=32';
// @ts-ignore
import MicrosoftIcon from '../../images/microsoft-icon.png?w=32&h=32';

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

enum ACCOUNT_CHOOSER_ACTION {
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

    if (silent) return this.autoChoose(hintEmailSignIn, hintEmailSignUp);

    this.setState({
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
    this.onSelection(await this.props.getAuthUrl(), ACCOUNT_CHOOSER_ACTION.ANOTHER_ACCOUNT);

  createNewAccount = async () =>
    this.onSelection(await this.props.getAuthUrl({ signup: true }), ACCOUNT_CHOOSER_ACTION.NEW_ACCOUNT);

  render() {
    const { activeSession, hint, theme, visitor } = this.props;
    const { hintEmailSignIn, hintEmailSignUp, isLoading } = this.state;
    console.log({activeSession, hint, theme, visitor})
    console.log({hintEmailSignIn, hintEmailSignUp, isLoading})

    if (isLoading) {
      return <CircularProgress />;
    }

    const haveAccountOptions =
      activeSession || hintEmailSignIn || hintEmailSignUp;
    return (
      <div data-qa="account-chooser" className={`account-chooser ${theme}`}>
        <span className="header">
          {haveAccountOptions
            ? 'Choose an account to get started'
            : 'Sign in to get started'}
        </span>

        {haveAccountOptions && (
          <div className="content">
            {(activeSession || hintEmailSignIn) && (
              <div className="button-group">
                {activeSession && (
                  <AccountChoice
                    avatar={activeSession.avatar}
                    email={activeSession.email}
                    qa="active-session"
                    onClick={activeSession.onSelect}
                    status={'Signed in'}
                  />
                )}

                {hintEmailSignIn && (
                  <AccountChoice
                    avatar={
                      hintEmailSignIn.authMode
                        ? AUTH_MODE_ICONS[hintEmailSignIn.authMode]
                        : undefined
                    }
                    email={hint!}
                    qa="sign-in-from-hint"
                    onClick={this.hintEmailSignIn}
                    status={'Signed out'}
                  />
                )}
              </div>
            )}

            {hintEmailSignUp && hintEmailSignUp.requireConsent && (
              <>
                <span className="notice">
                  We noticed <b>{hintEmailSignUp.email}</b> is a{' '}
                  {hintEmailSignUp.authMode} account
                </span>
                <button
                  data-qa="sign-up-with"
                  className="sign-up-with"
                  onClick={this.hintSsoSignUp}
                >
                  <img
                    alt="auth-mode-icon"
                    className="logo"
                    src={AUTH_MODE_ICONS[hintEmailSignUp.authMode!]}
                  />
                  <div className="text">
                    Sign up with {hintEmailSignUp.authMode}
                  </div>
                </button>

                <div className="separator">
                  <span>OR</span>
                </div>
              </>
            )}

            {hintEmailSignUp && (
              <AccountChoice
                email={hintEmailSignUp!.email}
                qa="sign-up-from-hint"
                onClick={this.hintEmailSignUp}
                status={'Create a MURAL account'}
              />
            )}
          </div>
        )}

        <div className="content">
          <button
            data-qa="use-another-account"
            className={
              haveAccountOptions ? 'link' : 'button light-color-button'
            }
            onClick={this.useAnotherAccount}
          >
            {haveAccountOptions ? 'Use another account' : 'Sign in'}
          </button>

          <div className="separator" />

          <div className="button-group">
            <button
              data-qa="create-account"
              className="button mural-color-button"
              onClick={this.createNewAccount}
            >
              Create a MURAL account
            </button>

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
        </div>

        <div className="footer">
          <img className="mural-logo" src={MuralLogo} alt="Mural logo" />
        </div>
      </div>
    );
  }
}
