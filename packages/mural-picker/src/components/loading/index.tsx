import CircularProgress from '@material-ui/core/CircularProgress';
import * as React from 'react';

export default class Loading extends React.Component {
  render() {
    return (
      <div className="card-list-spinner">
        <CircularProgress />
      </div>
    );
  }
}
