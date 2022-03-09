/**
 * NOTE:
 * The MURAL public API does not currently support template retrieval
 * and selection, so this component is not yet being used (and is not quite
 * finished). However, it's a functional start to the component, so I've left
 * this in here for when the API endpoints are available and we can flesh this
 * out.
 */

import { Button, Card, Divider, Grid, List, ListItem } from '@material-ui/core';
import * as React from 'react';

export interface PropTypes {
  token: string;
  onCancelAndGoBack: () => void;
  onCreateMural: (selectedTemplate: string) => void;
}

interface StateTypes {
  selectedTemplate: string;
}

const INITIAL_STATE: StateTypes = {
  selectedTemplate: '',
};

export default class CreateNewMural extends React.Component<PropTypes> {
  state: StateTypes = INITIAL_STATE;

  createMural() {
    this.props.onCreateMural(this.state.selectedTemplate);
  }

  render() {
    return (
      <>
        <List component="nav">
          <ListItem button selected>
            All templates
          </ListItem>
          <Divider />
          {/* TODO: get all templates when public API includes route */}
          <ListItem>BROWSE BY CATEGORY</ListItem>
          <ListItem button>MURAL</ListItem>
          <ListItem button>Icebreaker</ListItem>
        </List>
        <Grid container>
          {/* TODO: iterate over templates and display them
           * TODO: include horizontal scroll */}
          <Grid item>
            <Card>Blank mural</Card>
          </Grid>
        </Grid>
        <Button onClick={this.props.onCancelAndGoBack}>Cancel & go back</Button>
        <Button
          onClick={this.createMural}
          variant="contained"
          disabled={!!this.state.selectedTemplate}
        >
          Create Mural
        </Button>
      </>
    );
  }
}
