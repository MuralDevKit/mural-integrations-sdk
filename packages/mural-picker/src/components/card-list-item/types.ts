import { EventHandler } from '@muraldevkit/mural-integrations-common';

export type CardSize = 'small' | 'normal';

export interface PropTypes {
  cardSize: CardSize;
  isSelected: boolean;
  onClick?: EventHandler;
}
