import * as React from 'react';
import { FormControl, InputLabel, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Workspace } from 'mural-integrations-mural-client';

interface PropTypes {
  ListboxProps?: object | undefined;
  workspaces: Workspace[];
  workspace: Workspace | null;
  onWorkspaceSelect: (
    _: React.ChangeEvent<{}>,
    workspace: Workspace | null,
  ) => void;
}

export default class WorkspaceSelect extends React.Component<PropTypes> {
  render() {
    return (
      <React.Fragment>
        <FormControl className="mural-picker-select" data-qa="workspace-select">
          <div className="select-label">
            <InputLabel shrink>WORKSPACE</InputLabel>
          </div>
          <div className="workspace-list">
            <Autocomplete
              id="workspace-select"
              options={this.props.workspaces}
              ListboxProps={this.props.ListboxProps}
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
              groupBy={() => 'SWITCH TO'}
              onChange={this.props.onWorkspaceSelect}
              noOptionsText={'No results'}
            />
          </div>
        </FormControl>
      </React.Fragment>
    );
  }
}
