import { Button, Modal } from '@material-ui/core';
import {
  Mural,
  Room,
  Workspace,
} from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import MuralPicker from '../mural-picker';

import './styles.scss';

const MuralPickerModal: React.FC<MuralPicker['props']> = ({
  onSelect,
  ...props
}) => {
  const [isLaunchButtonDisabled, setIsLaunchButtonDisabled] =
    React.useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);

  const handleSelect = (
    mural: Mural,
    room: Room | null,
    workspace: Workspace,
  ) => {
    onSelect(mural, room, workspace);

    setIsLaunchButtonDisabled(true);
    toggleModal();
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div>
      <Button
        onClick={toggleModal}
        variant="contained"
        disabled={isLaunchButtonDisabled}
        data-qa="choose-mural-button"
      >
        Choose a mural
      </Button>
      <Modal
        open={isModalOpen}
        onClose={toggleModal}
        className="mural-picker-modal"
        data-qa="mural-picker-modal"
      >
        <MuralPicker {...props} onSelect={handleSelect} />
      </Modal>
    </div>
  );
};

export default MuralPickerModal;
