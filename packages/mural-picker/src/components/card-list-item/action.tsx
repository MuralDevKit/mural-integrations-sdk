import { Card, CardActionArea, Grid } from '@material-ui/core';
import classnames from 'classnames';
import * as React from 'react';
import './styles.scss';
import { PropTypes as ItemPropTypes } from './types';

export type ActionItemSource = {
  content: React.ReactNode;
  name: string;
  sort: 'start' | 'end';
};

export type PropTypes = { source: ActionItemSource } & ItemPropTypes;

export default (props: PropTypes) => {
  const { source, onClick } = props;

  return (
    <Grid item component="li">
      <Card
        variant="outlined"
        className={classnames('card-list-item', 'outline-dashed')}
        onClick={onClick}
      >
        <CardActionArea className="card-action">
          {source.content}
        </CardActionArea>
      </Card>
    </Grid>
  );
};
