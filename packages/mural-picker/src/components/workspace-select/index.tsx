import {
  MrlSelect,
  MrlSelectItem,
  MrlSelectMenu,
} from '@muraldevkit/ds-component-form-elements-react';
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
  handleChange = (newValue: any) => {
    const newWorkspace = this.props.workspaces.find(
      workspace => workspace.id == newValue,
    );
    if (newWorkspace) {
      this.props.onSelect(newWorkspace);
    }
  };

  render() {
    return (
      <MrlSelect
        attrs={{
          'data-qa': 'workspace-select',
        }}
        hookChange={this.handleChange}
        kind="inline"
        labelId="workspace-select"
      >
        <MrlSelectMenu selected={this.props.workspace.id} slot="menu">
          {this.props.workspaces.map(workspace => (
            <MrlSelectItem
              key={workspace.id}
              id={workspace.id}
              state={
                workspace.name === this.props.workspace?.name
                  ? 'selected'
                  : 'default'
              }
              value={workspace.id}
            >
              {workspace.name}
            </MrlSelectItem>
          ))}
        </MrlSelectMenu>
      </MrlSelect>
    );
  }
}
