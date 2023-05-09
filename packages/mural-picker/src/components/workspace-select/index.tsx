import { FormControl, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { EventHandler } from '@muraldevkit/mural-integrations-common';
import { Workspace } from '@muraldevkit/mural-integrations-mural-client';
import cx from 'classnames';
import * as React from 'react';
import Measure from 'react-measure';
import './styles.scss';

interface PropTypes {
  workspaces: Workspace[];
  workspace: Workspace | null;
  onSelect: EventHandler<[workspace: Workspace | null]>;
}

export default class WorkspaceSelectSlots extends React.Component<PropTypes> {
  handleChange = (_: React.ChangeEvent<{}>, workspace: Workspace | null) => {
    this.props.onSelect(workspace);
  };

  render() {
    return (
      <Measure bounds>
        {({ measureRef }) => {
          return (
            <FormControl
              ref={measureRef}
              className={cx('workspace-select')}
              data-qa="workspace-select"
            >
              <div className="workspace-list">
                <Autocomplete
                  id="workspace-select"
                  options={this.props.workspaces}
                  getOptionLabel={option => {
                    return option.name || '';
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      placeholder="Find a workspace..."
                      variant="outlined"
                    />
                  )}
                  value={this.props.workspace}
                  onChange={this.handleChange}
                  noOptionsText={'No results'}
                />
              </div>
            </FormControl>
          );
        }}
      </Measure>
    );
  }
}
