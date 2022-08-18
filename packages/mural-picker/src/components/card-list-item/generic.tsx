import { Card, CardActionArea, CardMedia, Grid } from '@material-ui/core';
import classnames from 'classnames';
import * as React from 'react';
import { PropTypes as ItemPropTypes } from './types';
import './styles.scss';

export type CardItemSource = {
  title: string;
  thumbnailUrl: URL | string;

  details?: string;
};

export type PropTypes = { source: CardItemSource } & ItemPropTypes;

export default (props: PropTypes) => {
  const { source, isSelected, onClick, cardSize } = props;

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
            image={source.thumbnailUrl.toString()}
            className="card-thumbnail"
          />
          <div className="card-info">
            <div className="card-title" data-qa="card-title">
              {source.title}
            </div>
            <div className="card-details" data-qa="card-details">
              {source.details || ''}
            </div>
          </div>
        </CardActionArea>
      </Card>
    </Grid>
  );
};
