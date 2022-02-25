import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

export default class Loading extends React.Component {
  render() {
    return (
      <div className="mural-list-spinner">
        <CircularProgress />
      </div>
    );
  }
}
