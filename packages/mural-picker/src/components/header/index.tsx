import * as React from 'react';
// @ts-ignore
import MuralIcon from '@muraldevkit/mural-integrations-common/assets/icon.png';

interface PropTypes {
  hideLogo?: boolean;
}

export default class Header extends React.Component<PropTypes> {
  render() {
    return (
      <h2>
        {!this.props.hideLogo && (
          <img className="choose-mural-logo" src={MuralIcon} alt="Mural logo" />
        )}
        <span className="choose-mural-title">Choose a mural</span>
      </h2>
    );
  }
}
