import { EventHandler } from '@muraldevkit/mural-integrations-common/src/types';

export type CardSize = 'small' | 'normal';

export interface PropTypes {
  cardSize: CardSize;
  isSelected: boolean;
  onClick: EventHandler;
}
