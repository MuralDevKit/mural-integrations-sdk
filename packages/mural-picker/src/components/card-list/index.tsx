import { Grid } from '@material-ui/core';
import { defaultBuilder } from '@muraldevkit/mural-integrations-common';
import { DeepPartial } from '@muraldevkit/mural-integrations-common/src/types';
import { EventHandler } from '@muraldevkit/mural-integrations-common/src/types';
import {
  Mural,
  Room,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import { ReactSlot } from '../../common/react';
import { MuralCardItem, CreateCardItem, CardSize } from '../card-list-item';
import './styles.scss';

interface Slots {
  MuralItem: ReactSlot<typeof MuralCardItem>;
  CreateItem: ReactSlot<typeof CreateCardItem>;
}

interface PropTypes {
  workspace: Workspace | null;
  room: Room | null;
  murals: Mural[];
  cardSize: CardSize;
  hideAddButton: boolean;

  onSelect: EventHandler<[mural: Mural]>;
  onCreate: EventHandler;
  onError: EventHandler<[e: Error, displayMsg: string]>;

  selectedMural?: Mural | null;
  slots?: DeepPartial<Slots>;
}

interface StateTypes {
  murals: Mural[];
  isCreateSelected: boolean;
  favorites: Mural[];
}

const useSlots = defaultBuilder<Slots>({
  MuralItem: MuralCardItem,
  CreateItem: CreateCardItem,
});

export default class CardList extends React.Component<PropTypes, StateTypes> {
  state = {
    murals: [],
    isCreateSelected: false,
    favorites: [],
  };

  componentDidMount() {
    const favorites = this.props.murals.filter(mural => {
      return mural.favorite;
    });

    this.setState({
      murals: this.props.murals,
      favorites,
    });
  }

  isSelected = (mural: Mural) =>
    !!this.props.selectedMural && this.props.selectedMural.id === mural.id;

  handleSelectFor = (mural: Mural) => () => {
    if (!mural) {
      return this.props.onError(
        new Error('Mural undefined'),
        'Error creating mural',
      );
    }
    this.setState({ isCreateSelected: false });

    this.props.onSelect(mural);
  };

  handleCreate = () => {
    this.props.onCreate();
  };

  renderFavoriteMurals = () => {
    const slots = useSlots(this.props.slots);

    return (
      <>
        <h5 className="subsection-header">Your favorite murals</h5>
        <Grid container className="mural-selector-grid" direction="row">
          {this.state.favorites.map((fave, i) => (
            <slots.MuralItem
              mural={fave}
              key={i}
              isSelected={this.isSelected(fave)}
              cardSize={this.props.cardSize}
              onClick={this.handleSelectFor(fave)}
            />
          ))}
        </Grid>
      </>
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
      const slots = useSlots(this.props.slots);
      return this.props.murals.map((mural, i) => (
        <slots.MuralItem
          mural={mural}
          key={i}
          isSelected={this.isSelected(mural)}
          onClick={this.handleSelectFor(mural)}
          cardSize={this.props.cardSize}
        />
      ));
    }
  };

  renderCreateNewMuralButton = () => {
    const slots = useSlots(this.props.slots);

    return (
      <slots.CreateItem
        onClick={this.handleCreate}
        cardSize={this.props.cardSize}
        isSelected={this.state.isCreateSelected}
      />
    );
  };

  render() {
    if (
      (!this.props.workspace || !this.props.room) &&
      this.state.favorites.length
    ) {
      return (
        <div className="mural-selector-container">
          <h5 className="subsection-header">All murals</h5>
          <Grid className="mural-grid" container direction="row">
            {this.renderCreateNewMuralButton()}
            {this.renderMurals()}
          </Grid>

          {this.renderFavoriteMurals()}
        </div>
      );
    }

    return (
      <div className="mural-selector-container">
        <Grid className="mural-selector-grid" container direction="row">
          {this.renderCreateNewMuralButton()}
          {this.renderMurals()}
        </Grid>
      </div>
    );
  }
}
