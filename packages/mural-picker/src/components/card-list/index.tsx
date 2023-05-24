import { EventHandler } from '@muraldevkit/mural-integrations-common';
import { Mural } from '@muraldevkit/mural-integrations-mural-client';
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

  const firstName = mural.createdBy?.firstName;
  const lastName = mural.createdBy?.lastName;

  return [`${firstName || ''} ${lastName || ''}`, `${updated} ago`].join('\n');
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
  handleSelectFor = (murals: Mural[]) => (idx: number) => {
    this.props.onSelect(murals[idx]);
  };

  handleAction = (actionName: string) => {
    switch (actionName) {
      case 'create':
        return this.props.onCreate();
    }
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
          onSelect={this.handleSelectFor(murals)}
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
          <div className="murals-container">
            {this.renderMurals(this.props.murals)}
          </div>
        </div>
      </div>
    );
  }
}
