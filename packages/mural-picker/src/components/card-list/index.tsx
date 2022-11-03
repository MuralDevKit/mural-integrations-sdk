import { EventHandler } from '@muraldevkit/mural-integrations-common';
import { Mural, Workspace } from '@muraldevkit/mural-integrations-mural-client';
import humanize from 'humanize-duration';
import * as React from 'react';
import { CardSize } from '../card-list-item';
import { CardListSection } from './card-list-section';
import './styles.scss';

export const muralCardItemSource = (mural: Mural) => {
  const { firstName, lastName } = mural.createdBy;

  return {
    title: mural.title || 'Untitled mural',
    details: dateMarkers(mural),
    thumbnailUrl: mural.thumbnailUrl,
    initials: (firstName[0] || '') + (lastName[0] || ''),
  };
};

const dateMarkers = (mural: Mural) => {
  const now = Date.now();
  const updated = humanize(now - mural.updatedOn, {
    round: true,
    units: ['d', 'h'],
  });
  const created = humanize(now - mural.createdOn, {
    round: true,
    units: ['d'],
  });

  return [`Created ${created} ago`, `Modified ${updated} ago`].join('\n');
};

interface PropTypes {
  murals: Mural[];
  cardSize: CardSize;
  workspace: Workspace;

  onSelect: EventHandler<[mural: Mural]>;
  onCreate: EventHandler;
  onError: EventHandler<[e: Error, displayMsg: string]>;

  selectedMural?: Mural | null;
}

export default class MuralCardList extends React.Component<PropTypes> {
  handleSelectFor =
    (murals: Mural[], section: 'favorites' | 'murals') => (idx: number) => {
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
    if (this.props.murals.length) {
      return (
        <CardListSection
          title="All murals"
          items={this.props.murals.map(muralCardItemSource)}
          cardSize={this.props.cardSize}
          onSelect={this.handleSelectFor(this.props.murals, 'murals')}
          onAction={this.handleAction}
          selected={selected}
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
