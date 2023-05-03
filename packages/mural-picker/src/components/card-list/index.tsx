import { EventHandler } from '@muraldevkit/mural-integrations-common';
import { Mural, Workspace } from '@muraldevkit/mural-integrations-mural-client';
import humanize from 'humanize-duration';
import * as React from 'react';
import { CardSize } from '../card-list-item';
import { CardListSection } from './card-list-section';
import './styles.scss';

export const muralCardItemSource = (mural: Mural) => {
  const firstName = mural.createdBy?.firstName;
  const lastName = mural.createdBy?.lastName;

  const firstInitial = firstName ? firstName[0] : '';
  const lastInitial = lastName ? lastName[0] : '';

  return {
    title: mural.title || 'Untitled mural',
    details: dateMarkers(mural),
    thumbnailUrl: mural.thumbnailUrl ?? '',
    initials: firstInitial + lastInitial,
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

  renderMurals = (murals: Mural[]) => {
    if (murals.length) {
      const selected = murals.findIndex(
        m => m.id === this.props.selectedMural?.id,
      );
      return (
        <CardListSection
          items={murals.map(muralCardItemSource)}
          cardSize={this.props.cardSize}
          onSelect={this.handleSelectFor(murals, 'murals')}
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
          <div>
            <div className="murals-container">
              {this.renderMurals(this.props.murals)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
