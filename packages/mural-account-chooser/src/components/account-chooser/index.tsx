import { CircularProgress } from '@material-ui/core';
import '@muraldevkit/mural-integrations-common/styles/fonts.css';
import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  AccountStatus,
  AuthMode,
  getAuthMode,
  getMuralRealm,
} from '../../common/realm';
import GoogleIcon from '../../images/google-icon.png?w=32&h=32';
import MicrosoftIcon from '../../images/microsoft-icon.png?w=32&h=32';
import MuralIcon from '../../images/mural-icon.png?w=32&h=32';
import MuralLogoMono from '../../images/mural-logo-mono.svg';
import MuralLogo from '../../images/mural-logo.svg';
import SignUpWith3rdParty from './sign-up-with-3rd-party';

export const FONT_FAMILY = 'Proxima Nova, sans-serif';
export const MURAL_COLOR = '#E02935';

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

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const AccountChooserDiv = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) => theme.primaryTextColor};
  background: ${({ theme }) => theme.backgroundColor};
`;

const MuralLogoImg = styled.img`
  width: 140px;
  margin: 45px 0;

  ${({ theme }) => {
    if (theme === 'dark')
      return {
        filter: 'invert(1)',
      };
  }}
`;

const AccountChooserContent = styled.div`
  background-color: ${({ theme }) => theme.contentBackgroundColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 450px;
  padding: 45px 30px;

  border: 2px solid rgba(0, 0, 0, 0.02);
  box-shadow: 0 16px 12px -4px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
`;

const Header = styled.h1`
  font-family: ${FONT_FAMILY};
  line-height: 100%;
  text-align: center;
  font-size: 2em;
  font-weight: 800;
  color: ${({ theme }) => theme.primaryTextColor};
`;

const EmailHintSignInDiv = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 5px 8px rgba(0, 0, 0, 0.08);
  border: #cccccc 1px solid;
  border-radius: 12px;
`;

const Email = styled.div`
  font-family: ${FONT_FAMILY};
  font-weight: 700;
  font-size: 16px;
  line-height: 16px;
  margin: 32px;
  color: ${({ theme }) => theme.secondaryTextColor};
`;

const Button = styled.button`
  cursor: pointer;
  border: none;
  border-radius: 8px;
  height: 44px;
  font-family: ${FONT_FAMILY};
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 20px;
`;

const EmailHintButton = styled(Button)`
  width: 90px;
  background: ${MURAL_COLOR};
  color: #ffffff;
  margin: 20px;
`;

const SignInButton = styled(Button)`
  width: 100%;
  background: ${MURAL_COLOR};
  color: #ffffff;
  margin: 0;
`;

const VisitorButton = styled(Button)`
  border: 2px solid ${({ theme }) => theme.secondaryTextColor};
  border-radius: 8px;
  width: 40%;
  background: ${({ theme }) => theme.contentBackgroundColor};
  color: ${({ theme }) => theme.secondaryTextColor};
`;

const UseDifferentEmail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
`;

const NotYourEmail = styled.div`
  font-family: ${FONT_FAMILY};
  color: ${({ theme }) => theme.primaryTextColor};
  font-size: 0.9em;
  line-height: 140%;
`;

const UseDifferentEmailLink = styled.a`
  cursor: pointer;
  background: none;
  padding: 0;
  margin: 3px;
  border: none;
  border-bottom: 1px dashed ${({ theme }) => theme.primaryTextColor};

  /* Font */
  font-family: ${FONT_FAMILY};
  color: ${({ theme }) => theme.primaryTextColor};
  font-weight: bold;
  font-size: 0.9em;
  line-height: 140%;
`;

const AUTH_MODE_ICONS = {
  [AuthMode.GOOGLE]: GoogleIcon,
  [AuthMode.MICROSOFT]: MicrosoftIcon,
  [AuthMode.ENTERPRISE_SSO]: null,
  [AuthMode.PASSWORD]: MuralIcon,
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
      ACCOUNT_CHOOSER_ACTION.SIGN_UP,
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
      ACCOUNT_CHOOSER_ACTION.SIGN_UP,
    );

  return (
    <>
      {isLoading ? (
        <Loading>
          <CircularProgress />
        </Loading>
      ) : (
        <AccountChooserDiv
          data-qa="account-chooser"
          theme={theme === 'light' ? LIGHT_THEME : DARK_THEME}
        >
          <MuralLogoImg
            src={theme === 'light' ? MuralLogo : MuralLogoMono}
            theme={theme}
            alt="MURAL"
          />
          <AccountChooserContent
            theme={theme === 'light' ? LIGHT_THEME : DARK_THEME}
          >
            {page === 'Sign in' ? (
              <>
                <Header>Sign in to get started</Header>
                {hint ? (
                  <EmailHintSignInDiv>
                    <Email>{hint}</Email>
                    <EmailHintButton
                      data-qa="continue-with-email"
                      onClick={continueWithEmail}
                    >
                      Continue
                    </EmailHintButton>
                  </EmailHintSignInDiv>
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
                iconSrc={
                  account?.authMode
                    ? AUTH_MODE_ICONS[account?.authMode]
                    : undefined
                }
                signUp={hintSsoSignUp}
                sendVerificationEmail={hintEmailSignUp}
                theme={theme === 'light' ? LIGHT_THEME : DARK_THEME}
              />
            )}
          </AccountChooserContent>
          {hint && page === 'Sign in' && (
            <UseDifferentEmail>
              <NotYourEmail>Not {hint}?</NotYourEmail>
              <UseDifferentEmailLink
                data-qa="use-another-account"
                onClick={useAnotherAccount}
                theme={theme === 'light' ? LIGHT_THEME : DARK_THEME}
              >
                Sign in with a different account
              </UseDifferentEmailLink>
            </UseDifferentEmail>
          )}
        </AccountChooserDiv>
      )}
    </>
  );
};

export default AccountChooser;
