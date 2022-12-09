import { Card, CardActionArea, CardMedia } from '@material-ui/core';
import { EventHandler } from '@muraldevkit/mural-integrations-common';
import * as React from 'react';
import styled from 'styled-components';

export type CardSize = 'small' | 'normal';

export type CardItemSource = {
  title: string;
  thumbnailUrl: URL | string;
  details?: string;
  initials?: string;
};

export interface MuralCardPropTypes {
  source: CardItemSource;
  cardSize: CardSize;
  isSelected: boolean;
  onClick: EventHandler;
  theme?: 'light' | 'dark';
}

export const FONT_FAMILY = 'Proxima Nova, sans-serif';
export const MURAL_COLOR = '#e8005a';
export const MARGIN = '23px';

interface Theme {
  primaryTextColor: string;
  backgroundColor: string;
}

export const LIGHT_THEME: Theme = {
  primaryTextColor: '#2f2f2f',
  backgroundColor: '#fff',
};

export const DARK_THEME: Theme = {
  primaryTextColor: '#a7a7a7',
  backgroundColor: '#424242',
};

// The MUI style overwrite styled-component by default, so add && to win
const MuralCardDiv = styled(Card)`
  && {
    width: 230px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.08);
    position: relative;

    font-family: 'Proxima Nova', -apple-system, BlinkMacSystemFont, 'Segoe UI',
      'Roboto', 'Oxygen', 'Ubuntu', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;

    margin: 0.675em 0.375em;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 8px;
    color: ${({ theme }) => theme.primaryTextColor};
    transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    transition-delay: 30ms;
    transition-property: translate, box-shadow;

    background-color: ${({ theme }) => theme.backgroundColor};
  }
`;

// The MUI style overwrite styled-component by default, so add && to win
const MuralCardActionArea = styled(CardActionArea)`
  && {
    padding: 0.8rem;
  }
`;

// The MUI style overwrite styled-component by default, so add && to win
const CardThumbnail = styled(CardMedia)`
  && {
    border-radius: 1rem;
    width: 100%;
    height: 130px;

    // vignette effect
    box-shadow: inset 2px 2px 15px rgba(0, 0, 0, 0.06);
  }
`;

const CardTitle = styled.div`
  font-weight: 600;
  margin-top: 0.875em;

  // ellipsis
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const CardInfo = styled.div`
  * {
    // prevents click event from happening on button children
    pointer-events: none;
  }

  display: flex;
  margin-top: 0.675em;
`;

const CardAvatar = styled.div`
  margin-right: 0.375em;
  height: 32px;
  width: 32px;

  background: rgba(35, 186, 150, 0.08);
  border-radius: 8px;
  box-shadow: inset 0px 0px 1px 1px rgba(0, 0, 0, 0.04);

  color: #23ba96;
  font-weight: 700;
  line-height: 32px;
  text-align: center;
`;

const CardDetails = styled.div`
  color: #737373;
  font-size: 0.675em;
  font-weight: 600;
  line-height: 1.375em;
  align-self: center;

  text-overflow: ellipsis;
  overflow: hidden;
  white-space: pre-line;
`;

const MuralCard: React.FC<MuralCardPropTypes> = (props: MuralCardPropTypes) => {
  const { source, onClick, theme } = props; // isSelected, cardSize

  return (
    <MuralCardDiv
      variant="outlined"
      theme={theme === 'dark' ? DARK_THEME : LIGHT_THEME}
      onClick={onClick}
    >
      <MuralCardActionArea>
        <CardThumbnail image={source.thumbnailUrl.toString()} />
        <CardTitle data-qa="card-title">{source.title}</CardTitle>
        <CardInfo>
          {/* TECHDEBT fetch avatar info from the API? */}
          {source.initials && (
            <CardAvatar data-qa="card-avatar">{source.initials}</CardAvatar>
          )}
          <CardDetails data-qa="card-details">
            {source.details || ''}
          </CardDetails>
        </CardInfo>
      </MuralCardActionArea>
    </MuralCardDiv>
  );
};

export default MuralCard;
