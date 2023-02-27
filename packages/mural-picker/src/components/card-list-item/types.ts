import { EventHandler } from '@muraldevkit/mural-integrations-common';

export type CardSize = 'normal' | 'small' | 'tiny';

export interface PropTypes {
  cardSize: CardSize;
  isSelected: boolean;
  onClick?: EventHandler;
}
