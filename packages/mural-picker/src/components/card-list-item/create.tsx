import { Card, CardActionArea, CardContent } from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import classnames from 'classnames';
import * as React from 'react';
import { PropTypes } from './types';
import './styles.scss';

export default function CreateCardItem(props: PropTypes) {
  return (
    <Card
      variant="outlined"
      className={classnames('card-list-item', {
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
  );
}
