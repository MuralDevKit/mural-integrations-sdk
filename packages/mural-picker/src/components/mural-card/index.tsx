import { Card, CardActionArea, CardMedia, Grid } from '@material-ui/core';
import { Mural } from '@muraldevkit/mural-integrations-mural-client';
import classnames from 'classnames';
import humanize from 'humanize-duration';
import * as React from 'react';
import './styles.scss';

export type CardSize = 'small' | 'normal';

export interface PropTypes {
  mural: Mural;
  isSelected: boolean;
  onClickSelectMural: (mural: Mural) => void;
  cardSize: CardSize;
}

const dateMarker = (mural: Mural) => {
  const span = Date.now() - mural.updatedOn;
  const marker = humanize(span, { round: true, units: ['d', 'h'] });

  return `Modified ${marker} ago`;
};

export default function MuralCard(props: PropTypes) {
  const { mural, isSelected, onClickSelectMural, cardSize } = props;
  const thumbnailUrl =
    mural.thumbnailUrl === 'https://app.mural.co/static/images/mural-thumb.svg'
      ? ''
      : mural.thumbnailUrl;

  return (
    <Grid item>
      <Card
        variant="outlined"
        className={classnames('mural-card', `${cardSize}-card`, {
          'selected-card': isSelected,
        })}
        onClick={() => onClickSelectMural(mural)}
      >
        <CardActionArea>
          <CardMedia
            // replacing blank mural temp thumbnail with blank canvas per mocks
            image={thumbnailUrl}
            component="div"
            className="mural-thumbnail"
          />
          <div className="mural-info">
            <div className="mural-title" data-qa="mural-title">
              {mural.title ? mural.title : 'Untitled mural'}
            </div>
            <div className="mural-details" data-qa="mural-details">
              {dateMarker(mural)}
            </div>
          </div>
        </CardActionArea>
      </Card>
    </Grid>
  );
}
