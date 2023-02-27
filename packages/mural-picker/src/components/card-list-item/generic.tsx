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
      <CardActionArea className="card-action-area">
        <CardMedia
          component="span"
          image={source.thumbnailUrl.toString()}
          className="card-thumbnail"
          title={`${source.title} thumbnail preview`}
        />
        <span className="card-title" data-qa="card-title">
          {source.title}
        </span>
        <span className="card-info">
          {/* TECHDEBT fetch avatar info from the API? */}
          {source.initials && (
            <span
              className="card-avatar card-avatar--initials"
              data-qa="card-avatar"
            >
              {source.initials}
            </span>
          )}
          <span className="card-details" data-qa="card-details">
            {source.details || ''}
          </span>
        </span>
      </CardActionArea>
    </Card>
  );
};
