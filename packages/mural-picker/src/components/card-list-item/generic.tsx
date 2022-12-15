import { Card, CardActionArea, CardMedia } from '@material-ui/core';
import classnames from 'classnames';
import * as React from 'react';
import './styles.scss';
import { PropTypes as ItemPropTypes } from './types';

export type CardItemSource = {
  title: string;
  thumbnailUrl: URL | string;

  details?: string;
  initials?: string;
};

export type PropTypes = { source: CardItemSource } & ItemPropTypes;

export default (props: PropTypes) => {
  const { source, isSelected, onClick, cardSize } = props;

  return (
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
        <div className="card-title" data-qa="card-title">
          {source.title}
        </div>
        <div className="card-info">
          {/* TECHDEBT fetch avatar info from the API? */}
          {source.initials && (
            <div
              className="card-avatar card-avatar--initials"
              data-qa="card-avatar"
            >
              {source.initials}
            </div>
          )}
          <div className="card-details" data-qa="card-details">
            {source.details || ''}
          </div>
        </div>
      </CardActionArea>
    </Card>
  );
};
