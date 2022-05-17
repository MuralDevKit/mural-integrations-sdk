import * as React from 'react';

// @ts-ignore
window.REACT__PICKER = React;
console.debug('mural-picker react', React);

import MuralPicker from './components/mural-picker';
import MuralPickerForm from './components/mural-picker-form';
import MuralPickerModal from './components/mural-picker-modal';
import RoomPicker from './components/room-picker';
import WorkspacePicker, {
  WorkspacePickerData,
} from './components/workspace-picker';

export * from './components/mural-picker';
export * from './components/room-picker';
export * from './common/delays';

export { TextField } from '@material-ui/core';

export {
  MuralPicker,
  RoomPicker,
  MuralPickerModal,
  WorkspacePicker,
  WorkspacePickerData,
  MuralPickerForm,
};
