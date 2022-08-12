import { Card, CardActionArea, CardMedia, Grid } from '@material-ui/core';
import { Mural } from '@muraldevkit/mural-integrations-mural-client';
import classnames from 'classnames';
import humanize from 'humanize-duration';
import * as React from 'react';
import { PropTypes as ItemPropTypes } from './types';
import './styles.scss';

const dateMarker = (mural: Mural) => {
  const span = Date.now() - mural.updatedOn;
  const marker = humanize(span, { round: true, units: ['d', 'h'] });

  return `Modified ${marker} ago`;
};

export type PropTypes = {
  mural: Mural;
} & ItemPropTypes;

export default (props: PropTypes) => {
  const { mural, isSelected, onClick, cardSize } = props;
  const thumbnailUrl =
    mural.thumbnailUrl === 'https://app.mural.co/static/images/mural-thumb.svg'
      ? ''
      : mural.thumbnailUrl;

  return (
    <Grid item>
      <Card
        variant="outlined"
        className={classnames('card-list-item', `${cardSize}-card`, {
          'selected-card': isSelected,
        })}
        onClick={onClick}
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
};
