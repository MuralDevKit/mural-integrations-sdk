import {
  DeepPartial,
  defaultBuilder,
} from '@muraldevkit/mural-integrations-common';
// @ts-ignore
import MuralIcon from '@muraldevkit/mural-integrations-common/src/assets/icon.png';
import * as React from 'react';
import { ReactSlot } from '../../common/react';

interface Slots {
  Logo: ReactSlot;
}

const useSlots = defaultBuilder<Slots>({
  Logo: () => (
    <img className="choose-mural-logo" src={MuralIcon} alt="Mural logo" />
  ),
});

type PropTypes = {
  children?: React.ReactNode;
  slots?: DeepPartial<Slots>;
};

export default class Header extends React.Component<PropTypes> {
  render() {
    const slots = useSlots(this.props.slots);

    return (
      <h2 className="mural-picker-header">
        <slots.Logo />
        <span className="choose-mural-title">{this.props.children}</span>
      </h2>
    );
  }
}
