import { Workspace } from '@muraldevkit/mural-integrations-mural-client';
import { WorkspacePicker } from '@muraldevkit/mural-integrations-mural-picker';
import { setCtxItem } from 'pickled-cucumber/context';
import * as React from 'react';
import { apiClient } from '../helpers/apiClient';
import { Page } from './types';

const workspacePicker: Page = {
  element: () => {
    const onSelect = (workspace: Workspace | null) => {
      setCtxItem('$lastSelectedWorkspace', workspace);
    };

    return (
      <WorkspacePicker
        apiClient={apiClient}
        onSelect={onSelect}
        onError={(_: Error, __: string) => {}}
      />
    );
  },
  items: {
    'workspace picker': 'workspace-picker',
    'workspace select': 'workspace-select',
    'workspace select button': 'workspace-picker-button',
  },
};

export default workspacePicker;
