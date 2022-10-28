import AddCircleIcon from '@material-ui/icons/AddCircle';
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

  onSelect: EventHandler<[mural: Mural]>;
  onCreate: EventHandler;
  onError: EventHandler<[e: Error, displayMsg: string]>;

  selectedMural?: Mural | null;
}

export default class MuralCardList extends React.Component<PropTypes> {
  handleSelectFor = (murals: Mural[], section: 'favorites' | 'murals') => (
    idx: number,
  ) => {
    this.setState({
      selected: {
        favorites: -1,
        murals: -1,
        [section]: idx,
      },
    });

    this.props.onSelect(murals[idx]);
  };

  handleAction = (actionName: string) => {
    switch (actionName) {
      case 'create':
        return this.props.onCreate();
    }
  };

  renderFavoriteMurals = () => {
    const favorites = this.props.murals.filter(mural => mural.favorite);
    if (favorites.length === 0) return null;

    const selected = favorites.findIndex(
      m => m.favorite && m.id === this.props.selectedMural?.id,
    );

    return (
      <CardListSection
        title="Your favorite murals"
        items={favorites.map(muralCardItemSource)}
        cardSize={this.props.cardSize}
        onSelect={this.handleSelectFor(favorites, 'favorites')}
        selected={selected}
      />
    );
  };

  renderMurals = () => {
    const selected = this.props.murals.findIndex(
      m => !m.favorite && m.id === this.props.selectedMural?.id,
    );

    // Display all murals or all murals in selected room
    return (
      <CardListSection
        title="All murals"
        actions={[
          {
            content: (
              <div>
                <AddCircleIcon />
                <div>Create new mural</div>
              </div>
            ),
            name: 'create',
            sort: 'start',
          },
        ]}
        items={
          this.props.murals ? this.props.murals.map(muralCardItemSource) : []
        }
        cardSize={this.props.cardSize}
        onSelect={this.handleSelectFor(this.props.murals, 'murals')}
        onAction={this.handleAction}
        selected={selected}
      />
    );
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
