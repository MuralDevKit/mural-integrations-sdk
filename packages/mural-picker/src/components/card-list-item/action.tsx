import { Card, CardActionArea, Grid } from '@material-ui/core';
import classnames from 'classnames';
import * as React from 'react';
import { PropTypes as ItemPropTypes } from './types';
import './styles.scss';

export type ActionItemSource = {
  name: string;
  title: string;
  sort: 'start' | 'end';
};

export type PropTypes = { source: ActionItemSource } & ItemPropTypes;

export default (props: PropTypes) => {
  const { source, onClick, cardSize } = props;

  return (
    <Grid item>
      <Card
        variant="outlined"
        className={classnames('card-list-item', `${cardSize}-card`)}
        onClick={onClick}
      >
        <CardActionArea className="card-action">{source.title}</CardActionArea>
      </Card>
    </Grid>
  );
};