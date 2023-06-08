import { EventHandler } from '@muraldevkit/mural-integrations-common';
import * as React from 'react';
import ActionCardItem, { ActionItemSource } from '../card-list-item/action';
import CardItem, { CardItemSource } from '../card-list-item/generic';
import './styles.scss';

interface PropTypes {
  items: CardItemSource[];
  onSelect: EventHandler<[idx: number, item: CardItemSource]>;

  actions?: ActionItemSource[];
  onAction?: EventHandler<[actionName: string]>;
  title?: string;
  selected?: number;
}

export class CardListSection extends React.Component<PropTypes> {
  handleAction = (name: string) => () => {
    if (!this.props.onAction) return;

    this.props.onAction(name);
  };

  handleSelectFor = (idx: number) => () => {
    this.props.onSelect(idx, this.props.items[idx]);
  };

  renderActionItem = (item: ActionItemSource) => (
    <ActionCardItem
      key={item.name}
      isSelected={false}
      source={item}
      onClick={this.handleAction(item.name)}
    />
  );

  renderTitle() {
    if (!this.props.title) return null;

    return <h3 className="subsection-header">{this.props.title}</h3>;
  }

  render() {
    // splits the actions between `start` and `end`
    const startActions = this.props.actions?.filter(
      action => action.sort === 'start',
    );
    const endActions = this.props.actions?.filter(
      action => action.sort === 'end',
    );

    return (
      <>
        {this.renderTitle()}
        <div className="mural-grid">
          {startActions?.map(this.renderActionItem)}
          {this.props.items.map((item, i) => (
            <div className="mural-grid-item">
              <CardItem
                key={i}
                source={item}
                isSelected={this.props.selected === i}
                onClick={this.handleSelectFor(i)}
              />
            </div>
          ))}
          <div className="mural-grid-item-last"></div>
          {endActions?.map(this.renderActionItem)}
        </div>
      </>
    );
  }
}
