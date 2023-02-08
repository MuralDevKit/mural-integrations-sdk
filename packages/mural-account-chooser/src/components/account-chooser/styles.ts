import styled from 'styled-components';

export const FONT_FAMILY = 'Proxima Nova, sans-serif';
export const MURAL_COLOR = '#e02935';

export const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

export const AccountChooserContainer = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) => theme.primaryTextColor};
  background: ${({ theme }) => theme.backgroundColor};
`;

export const MuralLogoContainer = styled.div`
  display: inline-block;
  width: 140px;
  margin: 45px 0;
`;

export const AccountChooserContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;

  box-sizing: border-box;
  max-width: 450px;
  width: 90%;
  padding: 45px 30px;

  background-color: ${({ theme }) => theme.contentBackgroundColor};
  border: 2px solid rgba(0, 0, 0, 0.02);
  box-shadow: 0 16px 12px -4px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
`;

export const Header = styled.h1`
  font-family: ${FONT_FAMILY};
  line-height: 100%;
  text-align: center;
  font-size: 2em;
  font-weight: 800;
  color: ${({ theme }) => theme.primaryTextColor};
  margin: 0;
`;

export const HintContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;

  width: 100%;
  box-sizing: border-box;
  padding: 20px;

  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08), 0 5px 8px rgba(0, 0, 0, 0.08);
  border: #cccccc 1px solid;
  border-radius: 12px;
`;

export const Email = styled.div`
  flex-grow: 1;
  width: 60%;

  font-family: ${FONT_FAMILY};
  font-weight: 700;
  font-size: 16px;
  line-height: 16px;
  color: ${({ theme }) => theme.secondaryTextColor};

  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const Button = styled.button`
  cursor: pointer;
  border: none;
  border-radius: 8px;
  height: 40px;
  font-family: ${FONT_FAMILY};
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 20px;
`;

export const ContinueButton = styled(Button)`
  flex-grow: 1;

  background: ${MURAL_COLOR};
  color: #ffffff;
  padding: 0 14px;
`;

export const SignInButton = styled(Button)`
  width: 100%;
  background: ${MURAL_COLOR};
  color: #ffffff;
  margin: 0;
`;

export const VisitorButton = styled(Button)`
  border: 2px solid ${({ theme }) => theme.secondaryTextColor};
  border-radius: 8px;
  max-width: 175px;
  width: 100%;
  background: ${({ theme }) => theme.contentBackgroundColor};
  color: ${({ theme }) => theme.secondaryTextColor};
`;

export const UseDifferentEmail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
`;

export const NotYourEmail = styled.div`
  font-family: ${FONT_FAMILY};
  color: ${({ theme }) => theme.primaryTextColor};
  font-size: 0.9em;
  line-height: 140%;
`;

export const UseDifferentEmailLink = styled.a`
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
