import { MenuItem, FormControl, Select } from '@material-ui/core';
import { EventHandler } from '@muraldevkit/mural-integrations-common';
import { Workspace } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import './styles.scss';

interface PropTypes {
  workspaces: Workspace[];
  workspace: Workspace;
  onSelect: EventHandler<[workspace: Workspace | null]>;
}

export default class WorkspaceSelectSlots extends React.Component<PropTypes> {
  handleChange = (event: any) => {
    const currentWorkspace = this.props.workspaces.filter(
      workspace => workspace.id === event.target.value,
    );
    if (currentWorkspace) this.props.onSelect(currentWorkspace[0]);
  };

  render() {
    return (
      <FormControl variant="standard">
        <Select
          data-qa="workspace-select"
          labelId="workspace-select"
          value={this.props.workspace.id || this.props.workspaces[0].id}
          onChange={this.handleChange}
          label="workspace"
        >
          {this.props.workspaces.map(workspace => (
            <MenuItem key={workspace.id} value={workspace.id}>
              {workspace.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
}
