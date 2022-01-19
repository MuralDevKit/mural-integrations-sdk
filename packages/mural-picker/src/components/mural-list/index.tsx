import * as React from 'react';
import classnames from 'classnames';
import { Card, CardActionArea, CardContent, Grid } from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import {
  Mural as MuralType,
  Room,
  WorkSpace,
} from 'mural-integrations-mural-client';
import MuralCard, { CardSize } from '../mural-card';
import './styles.scss';

interface PropTypes {
  workspace: WorkSpace | null;
  room: Room | null;
  isCreateSelected?: boolean;
  murals: MuralType[];
  selectedMural?: MuralType;
  onMuralSelect: (mural: MuralType) => void;
  onCreateMural: () => void;
  handleError: (e: Error, displayMsg: string) => void;
  cardSize: CardSize;
  hideAddButton: boolean;
}

interface StateTypes {
  favorites: MuralType[];
}

const INITIAL_STATE: StateTypes = {
  favorites: [],
};

export default class MuralList extends React.Component<PropTypes> {
  state: StateTypes = INITIAL_STATE;

  componentDidMount() {
    const favorites = this.props.murals.filter(mural => {
      return mural.favorite;
    });
    this.setState({
      murals: this.props.murals,
      favorites,
    });
  }

  isSelectedMural = (mural: MuralType) => {
    return (
      !!this.props.selectedMural && this.props.selectedMural.id === mural.id
    );
  };

  onClickSelectMural = (mural: MuralType) => {
    if (!mural) {
      return this.props.handleError(
        new Error('Mural undefined'),
        'Error creating mural',
      );
    }
    this.setState({ isCreateSelected: false });
    this.props.onMuralSelect(mural);
  };

  onCreateMural = () => {
    this.setState({ isCreateSelected: true });
    this.props.onCreateMural();
  };

  renderFavoriteMurals = () => {
    return (
      <div>
        <h5 className="subsection-header">Your favorite murals</h5>
        <Grid container direction="row">
          {this.state.favorites.map((fave, i) => (
            <MuralCard
              mural={fave}
              key={i}
              isSelected={this.isSelectedMural(fave)}
              onClickSelectMural={this.onClickSelectMural}
              cardSize={this.props.cardSize}
            />
          ))}
        </Grid>
      </div>
    );
  };

  renderMurals = () => {
    /*
    TODO:
    If a user has not selected workspace and room, display 3 rows of murals:
    1. create a mural button + templates (e.g. icebreaker)
    2. recently opened murals (is this in the private API?)
    3. favorite murals
  */

    // Display all murals or all murals in selected room
    if (this.props.murals.length) {
      return this.props.murals.map((mural, i) => (
        <MuralCard
          mural={mural}
          key={i}
          isSelected={this.isSelectedMural(mural)}
          onClickSelectMural={this.onClickSelectMural}
          cardSize={this.props.cardSize}
        />
      ));
    }
  };

  renderCreateNewMuralButton = () => {
    if (this.props.hideAddButton) {
      return null;
    }

    return (
      <Grid item>
        <Card
          variant="outlined"
          className={classnames('mural-card', `${this.props.cardSize}-card`, {
            'selected-card': !!this.props.isCreateSelected,
          })}
          id="create-a-mural"
        >
          <CardActionArea onClick={this.onCreateMural}>
            <CardContent className="mural-info">
              <AddCircleIcon />
              <h4 data-qa="create-new-mural">Create new mural</h4>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };

  render() {
    if (
      (!this.props.workspace || !this.props.room) &&
      this.state.favorites.length
    ) {
      return (
        <div className="mural-selector-container">
          <Grid container direction="row">
            {this.renderCreateNewMuralButton()}
          </Grid>
          {this.renderFavoriteMurals()}
          {/* TODO: scroll horizontally instead of rendering all */}
          <div>
            <h5 className="subsection-header">All murals</h5>
            <Grid container direction="row">
              {this.renderMurals()}
            </Grid>
          </div>
        </div>
      );
    }

    return (
      <Grid container direction="row" className="mural-selector-container">
        {this.renderCreateNewMuralButton()}
        {this.renderMurals()}
        {/* TODO: scroll horizontally instead of rendering all */}
      </Grid>
    );
  }
}
