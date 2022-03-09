import { Button, Modal } from '@material-ui/core';
import { Mural } from '@tactivos/mural-integrations-mural-client';
import * as React from 'react';
import MuralPicker, { PropTypes as MuralPickerProps } from '../mural-picker';

import './styles.scss';

const MuralPickerModal: React.FC<MuralPickerProps> = ({
  onMuralSelect,
  ...props
}) => {
  const [isLaunchButtonDisabled, setIsLaunchButtonDisabled] =
    React.useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);

  const handleSelectMural = (mural: Mural) => {
    onMuralSelect(mural);
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
        <MuralPicker {...props} onMuralSelect={handleSelectMural} />
      </Modal>
    </div>
  );
};

export default MuralPickerModal;
