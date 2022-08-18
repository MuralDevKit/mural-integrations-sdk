import { EventHandler } from '@muraldevkit/mural-integrations-common';
import * as React from 'react';
import { CardSize } from '../card-list-item';
import './styles.scss';
import { Mural } from '@muraldevkit/mural-integrations-mural-client';
import humanize from 'humanize-duration';
import { CardListSection } from './card-list-section';

export const muralCardItemSource = (mural: Mural) => ({
  title: mural.title || 'Untitled mural',
  details: dateMarker(mural),
  thumbnailUrl: mural.thumbnailUrl,
});

const dateMarker = (mural: Mural) => {
  const span = Date.now() - mural.updatedOn;
  const marker = humanize(span, { round: true, units: ['d', 'h'] });

  return `Modified ${marker} ago`;
};

interface PropTypes {
  murals: Mural[];
  cardSize: CardSize;
  hideAddButton: boolean;

  onSelect: EventHandler<[mural: Mural]>;
  onCreate: EventHandler;
  onError: EventHandler<[e: Error, displayMsg: string]>;

  selectedMural?: Mural | null;
}

interface StateTypes {
  murals: Mural[];
  favorites: Mural[];
}

export default class MuralCardList extends React.Component<
  PropTypes,
  StateTypes
> {
  state = {
    murals: [],
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

  handleSelectFor = (section: 'favorites' | 'murals') => (idx: number) => {
    this.props.onSelect(this.state[section][idx]);
  };

  handleAction = (actionName: string) => {
    switch (actionName) {
      case 'create':
        return this.props.onCreate();
    }
  };

  renderFavoriteMurals = () => {
    if (this.state.favorites.length === 0) return null;

    return (
      <CardListSection
        title="Your favorite murals"
        items={this.state.favorites.map(muralCardItemSource)}
        cardSize={this.props.cardSize}
        onSelect={this.handleSelectFor('favorites')}
      />
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
      return (
        <CardListSection
          title="All murals"
          actions={[
            { title: 'Create new mural', name: 'create', sort: 'start' },
          ]}
          items={this.state.murals.map(muralCardItemSource)}
          cardSize={this.props.cardSize}
          onSelect={this.handleSelectFor('murals')}
          onAction={this.handleAction}
        />
      );
    }
  };

  render() {
    return (
      <div className="mural-selector-container">
        <div className="mural-selector-grid">
          {this.renderFavoriteMurals()}
          {this.renderMurals()}
        </div>
      </div>
    );
  }
}
