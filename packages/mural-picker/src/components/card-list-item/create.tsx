import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Card, CardActionArea, Grid, CardContent } from '@material-ui/core';
import classnames from 'classnames';
import * as React from 'react';
import { PropTypes } from './types';
import './styles.scss';

export default function CreateCardItem(props: PropTypes) {
  return (
    <Grid item>
      <Card
        variant="outlined"
        className={classnames('card-list-item', `${props.cardSize}-card`, {
          'selected-card': props.isSelected,
        })}
        id="create-a-mural"
      >
        <CardActionArea onClick={props.onClick}>
          <CardContent className="mural-info">
            <AddCircleIcon />
            <h4 data-qa="create-new-mural">Create new mural</h4>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
}
