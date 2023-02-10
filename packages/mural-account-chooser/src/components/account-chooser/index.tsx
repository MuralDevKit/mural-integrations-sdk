import { CircularProgress } from '@material-ui/core';
import { ReactComponent as MuralLogoMono } from '@muraldevkit/mural-integrations-common/assets/brands/mural-wordmark-mono.svg';
import { ReactComponent as MuralLogo } from '@muraldevkit/mural-integrations-common/assets/brands/mural-wordmark.svg';
import '@muraldevkit/mural-integrations-common/styles/fonts.css';
import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  AccountStatus,
  AuthMode,
  getAuthMode,
  getMuralRealm,
} from '../../common/realm';
import SignUpWith3rdParty from './sign-up-with-3rd-party';
import {
  AccountChooserContainer,
  AccountChooserContent,
  ContinueButton,
  Email,
  Header,
  HintContainer,
  Loading,
  MuralLogoContainer,
  ChangeAccount,
  SignInButton,
  CreateOrUseADifferentAccount,
  CreateOrSignin,
  VisitorButton,
} from './styles';

interface Theme {
  primaryTextColor: string;
  secondaryTextColor: string;
  backgroundColor: string;
  contentBackgroundColor: string;
}

export const LIGHT_THEME: Theme = {
  primaryTextColor: '#2f2f2f',
  secondaryTextColor: '#4d4d4d',
  backgroundColor: '#f4f7fb',
  contentBackgroundColor: '#ffffff',
};

export const DARK_THEME: Theme = {
  primaryTextColor: '#f4f4f4',
  secondaryTextColor: '#d6d6d6',
  backgroundColor: '#1f1f1e',
  contentBackgroundColor: '#292929',
};

interface AutomaticOptions {
  email: string;
  action: 'signin' | 'signup';
  consentSso?: boolean;
}

export interface AuthorizeParams {
  auto?: boolean | AutomaticOptions;
  signup?: boolean;
}

// eslint-disable-next-line no-shadow
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

interface Account {
  email: string;
  authMode?: AuthMode;
  accountExist: boolean;
  requireConsent?: boolean;
}

type PageName = 'Sign in' | 'SSO Option';

const AccountChooser: React.FC<AccountChooserPropTypes> = (
  props: AccountChooserPropTypes,
) => {
  const { hint, visitor, onError, getAuthUrl, apiClient, onSelection, theme } =
    props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<PageName>('Sign in');
  const [account, setAccount] = useState<Account>();

  useEffect(() => {
    (async () => {
      if (hint) {
        const realm = await loadRealm(hint);
        if (realm) {
          const authMode = getAuthMode(realm);
          const accountExist =
            realm.accountStatus === AccountStatus.VALID ||
            realm.accountStatus === AccountStatus.UNVERIFIED;
          setAccount({
            email: hint,
            authMode,
            accountExist,
            requireConsent: accountExist ? undefined : realm?.requireConsent,
          });
        }
      }

      setIsLoading(false);
    })();
  }, []);

  const loadRealm = async (email: string) => {
    try {
      return await getMuralRealm(apiClient, email);
    } catch (e: any) {
      onError(e);
      return null;
    }
  };

  const signIn = async () => {
    onSelection(await getAuthUrl(), ACCOUNT_CHOOSER_ACTION.SIGN_IN);
  };

  const useAnotherAccount = async () =>
    onSelection(await getAuthUrl(), ACCOUNT_CHOOSER_ACTION.ANOTHER_ACCOUNT);

  const signUpForAccount = async () => {
    onSelection(
      await getAuthUrl({ signup: true }),
      ACCOUNT_CHOOSER_ACTION.SIGN_UP,
    );
  };

  const continueWithEmail = async () => {
    if (!hint) {
      return;
    }

    // The hint email is already associated with a mural account
    // so sign in
    if (account?.accountExist) {
      onSelection(
        await getAuthUrl({
          auto: {
            action: 'signin',
            email: hint,
          },
        }),
        ACCOUNT_CHOOSER_ACTION.SIGN_IN,
      );
      return;
    }

    // The hint email is not a mural account yet, but it requires consent
    // from a third party like Google, Microsoft, or SSO.
    if (account?.requireConsent) {
      setPage('SSO Option');
      return;
    }

    // The hint email is not a mural account yet
    hintEmailSignUp();
  };

  const hintEmailSignUp = async () =>
    onSelection(
      await getAuthUrl({
        auto: {
          action: 'signup',
          consentSso: false,
          email: hint!,
        },
      }),
      ACCOUNT_CHOOSER_ACTION.NEW_ACCOUNT,
    );

  const hintSsoSignUp = async () =>
    onSelection(
      await getAuthUrl({
        auto: {
          action: 'signup',
          consentSso: true,
          email: hint!,
        },
      }),
      ACCOUNT_CHOOSER_ACTION.NEW_ACCOUNT,
    );

  const Logo = theme === 'light' ? MuralLogo : MuralLogoMono;

  return (
    <>
      {isLoading ? (
        <Loading>
          <CircularProgress />
        </Loading>
      ) : (
        <AccountChooserContainer
          data-qa="account-chooser"
          theme={theme === 'light' ? LIGHT_THEME : DARK_THEME}
        >
          <MuralLogoContainer theme={theme}>
            <Logo alt="Mural" />
          </MuralLogoContainer>
          <AccountChooserContent
            theme={theme === 'light' ? LIGHT_THEME : DARK_THEME}
          >
            {page === 'Sign in' ? (
              <>
                <Header>Sign in to get started</Header>
                {hint ? (
                  <HintContainer>
                    <Email>{hint}</Email>
                    <ContinueButton
                      data-qa="continue-with-email"
                      onClick={continueWithEmail}
                    >
                      Continue
                    </ContinueButton>
                  </HintContainer>
                ) : (
                  <SignInButton data-qa="sign-up" onClick={signIn}>
                    Sign in
                  </SignInButton>
                )}
                {visitor && (
                  <VisitorButton
                    data-qa="continue-as-visitor"
                    onClick={visitor.onSelect}
                    theme={theme === 'light' ? LIGHT_THEME : DARK_THEME}
                  >
                    Continue as a visitor
                  </VisitorButton>
                )}
              </>
            ) : (
              <SignUpWith3rdParty
                name={account?.authMode?.toString() ?? ''}
                authMode={account?.authMode ?? AuthMode.PASSWORD}
                signUp={hintSsoSignUp}
                sendVerificationEmail={hintEmailSignUp}
                theme={theme === 'light' ? LIGHT_THEME : DARK_THEME}
              />
            )}
          </AccountChooserContent>
          {hint && page === 'Sign in' ? (
            <CreateOrUseADifferentAccount>
              <ChangeAccount>
                Not <em>{hint}</em> ?
              </ChangeAccount>
              <CreateOrSignin
                data-qa="create-or-signin"
                onClick={useAnotherAccount}
                theme={theme === 'light' ? LIGHT_THEME : DARK_THEME}
              >
                Sign in with a different account
              </CreateOrSignin>
            </CreateOrUseADifferentAccount>
          ) : (
            <CreateOrUseADifferentAccount>
              <ChangeAccount>Don't have an account ?</ChangeAccount>
              <CreateOrSignin
                data-qa="create-or-signin"
                onClick={signUpForAccount}
                theme={theme === 'light' ? LIGHT_THEME : DARK_THEME}
              >
                Get started for free
              </CreateOrSignin>
            </CreateOrUseADifferentAccount>
          )}
        </AccountChooserContainer>
      )}
    </>
  );
};

export default AccountChooser;
