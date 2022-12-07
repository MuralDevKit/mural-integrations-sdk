import { Button } from '@material-ui/core';
import {
  DeepPartial,
  defaultBuilder,
} from '@muraldevkit/mural-integrations-common';
import * as React from 'react';
import { ReactSlot } from '../../common/react';

interface Slots {
  /** @deprecated — Do not add a logo unless you have no action */
  Logo: ReactSlot<React.ReactHTML['img']>;
  Action: ReactSlot<typeof Button>;
}

const useSlots = defaultBuilder<Slots>({
  Logo: () => null,
  Action: props => <Button onClick={console.log} {...props} />,
});

type PropTypes = {
  children?: React.ReactNode;
  slots?: DeepPartial<Slots>;
};

export default class Header extends React.Component<PropTypes> {
  render() {
    const slots = useSlots(this.props.slots);

    return (
      <h2 className="header">
        <slots.Action className="header__action" />
        <slots.Logo className="header__logo" />
        <span className="header__title">{this.props.children}</span>
      </h2>
    );
  }
}
