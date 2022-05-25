import Alert from '@material-ui/lab/Alert';
import * as React from 'react';

export interface PropTypes {
  error: string;
}

export default class MuralPickerError extends React.Component<PropTypes> {
  render() {
    return (
      <div data-qa="mural-picker-error">
        <Alert severity="error" className="mural-picker-error">
          {this.props.error}
        </Alert>
      </div>
    );
  }
}
