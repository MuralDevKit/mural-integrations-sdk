import { Grid, Card, CardActionArea, CardMedia } from '@material-ui/core';
import { Mural } from '@tactivos/mural-integrations-mural-client';
import classnames from 'classnames';
import * as moment from 'moment';
import * as React from 'react';
import './styles.scss';

export type CardSize = 'small' | 'normal';

export interface PropTypes {
  mural: Mural;
  isSelected: boolean;
  onClickSelectMural: (mural: Mural) => void;
  cardSize: CardSize;
}

export default function MuralCard(props: PropTypes) {
  const { mural, isSelected, onClickSelectMural, cardSize } = props;
  const thumbnailUrl =
    mural.thumbnailUrl === 'https://app.mural.co/static/images/mural-thumb.svg'
      ? ''
      : mural.thumbnailUrl;

  return (
    <Grid item className="mural-preview">
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
              Modified {moment(mural.updatedOn).fromNow()}
            </div>
          </div>
        </CardActionArea>
      </Card>
    </Grid>
  );
}
