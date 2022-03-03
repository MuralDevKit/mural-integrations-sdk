import * as React from 'react';
import { CircularProgress } from '@material-ui/core';
import { AccountStatus, AuthMode, getAuthMode, getMuralRealm } from '../../common/realm';
import { AuthorizeParams } from "./types";
import AccountChoice from './account-choice';
import './styles.scss';

// @ts-ignore
import MuralLogo from '../../images/mural-logo.png';
// @ts-ignore
import GoogleIcon from '../../images/google-icon.png';
// @ts-ignore
import MicrosoftIcon from '../../images/microsoft-icon.png';


const AUTH_MODE_ICONS = {
  [AuthMode.GOOGLE]: GoogleIcon,
  [AuthMode.MICROSOFT]: MicrosoftIcon,
  [AuthMode.ENTERPRISE_SSO]: null,
  [AuthMode.PASSWORD]: null,
};

export interface AccountChooserPropTypes {
  activeSession?: { email: string; avatar: string; onSelect: () => void };
  getAuthUrl: (options?: AuthorizeParams) => Promise<string>;
  hint?: string;
  onError: (e: Error) => void;
  onSelection?: (url: string) => void;
  silent?: boolean;
  theme?: 'light' | 'dark';
  visitor?: { onSelect: () => void };
  webAppUrl: string;
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
      const authMode = realm ? getAuthMode(realm) : undefined;
      const accountExist = realm && realm.accountStatus === AccountStatus.VALID;

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

    if (silent) return this.autoChoose(hintEmailSignIn, hintEmailSignUp);

    this.setState({
      hintEmailSignIn,
      hintEmailSignUp,
      isLoading: false,
    });
  }

  loadRealm = async (email: string) => {
    const { webAppUrl } = this.props;
    try {
      return await getMuralRealm(webAppUrl, email);
    } catch (e) {
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

  onSelection = (url: string) => {
    if (this.props.onSelection) {
      this.props.onSelection(url);
    } else {
      window.location.href = url;
    }
  };

  hintEmailSignIn = async () =>
      this.onSelection(
          await this.props.getAuthUrl({
              auto: {
                  email: this.props.hint!,
              },
          }),
      );

  hintEmailSignUp = async () =>
      this.onSelection(
          await this.props.getAuthUrl({
              auto: {
                  email: this.props.hint!,
                  signup: true,
                  consentSso: false,
              },
          }),
      );

  hintSsoSignUp = async () =>
      this.onSelection(
          await this.props.getAuthUrl({
              auto: {
                  email: this.props.hint!,
                  signup: true,
                  consentSso: true,
              },
          }),
      );

  useAnotherAccount = async () => this.onSelection(await this.props.getAuthUrl());

  createNewAccount = async () => this.onSelection(await this.props.getAuthUrl({signup: true}));

  render() {
    const { activeSession, hint, theme, visitor } = this.props;
    const { hintEmailSignIn, hintEmailSignUp, isLoading } = this.state;

    if (isLoading) {
      return <CircularProgress />;
    }

    const noAccountOptions =
      !activeSession && !hintEmailSignIn && !hintEmailSignUp;
    return (
      <div data-qa="account-chooser" className={`account-chooser ${theme}`}>
        <h1 className="title">Choose an account to get started</h1>

        {activeSession && (
          <div>
            <AccountChoice
              avatar={activeSession.avatar}
              email={activeSession.email}
              onClick={activeSession.onSelect}
              status={'Signed in'}
            />
          </div>
        )}

        {hintEmailSignIn && (
          <div data-qa="sign-in-from-hint">
            <AccountChoice
              avatar={
                hintEmailSignIn.authMode
                  ? AUTH_MODE_ICONS[hintEmailSignIn.authMode]
                  : undefined
              }
              email={hint!}
              onClick={this.hintEmailSignIn}
              status={'Signed out'}
            />
          </div>
        )}

        {hintEmailSignUp && hintEmailSignUp.requireConsent && (
          <div>
            <p className="notice">
              We noticed <b>{hintEmailSignUp.email}</b> is a{' '}
              {hintEmailSignUp.authMode} account
            </p>
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
          </div>
        )}

        {hintEmailSignUp && (
          <div data-qa="sign-up-from-hint">
            <AccountChoice
              email={hintEmailSignUp!.email}
              onClick={this.hintEmailSignUp}
              status={'Create a MURAL account'}
            />
          </div>
        )}

        <div>
          <button
            data-qa="use-another-account"
            className={noAccountOptions ? 'light-color-button' : 'link'}
            onClick={this.useAnotherAccount}
          >
            {noAccountOptions ? 'Sign in' : 'Use another account'}
          </button>
        </div>

        <div className="separator" />

        <div>
          <button
            data-qa="create-account"
            className="mural-color-button"
            onClick={this.createNewAccount}
          >
            Create a MURAL account
          </button>
        </div>

        {visitor && (
          <div>
            <button
              data-qa="continue-as-visitor"
              className="light-color-button"
              onClick={visitor.onSelect}
            >
              Continue as visitor
            </button>
          </div>
        )}

        <div>
          <img className="mural-logo" src={MuralLogo} alt="Mural logo" />
        </div>
      </div>
    );
  }
}
