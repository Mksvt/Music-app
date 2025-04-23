import React, { useCallback, memo } from 'react';
import Modal from '../Modal';

interface ConfirmDeleteAudioModalProps {
  isOpen: boolean;
  trackTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteAudioModal: React.FC<ConfirmDeleteAudioModalProps> = ({
  isOpen,
  trackTitle,
  onConfirm,
  onCancel,
}) => {
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <div data-testid="confirm-audio-delete-dialog" className="p-6 inset-0 z-50 bg-white rounded-lg shadow-lg max-w-sm mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Audio Deletion</h2>
        <p className="mb-6 text-gray-600">Are you sure you want to delete the audio for "{trackTitle}"?</p>
        <div className="flex gap-3">
          <button
            data-testid="confirm-audio-delete"
            onClick={handleConfirm}
            className="flex-1 bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Delete Audio
          </button>
          <button
            data-testid="cancel-audio-delete"
            onClick={handleCancel}
            className="flex-1 bg-gray-500 px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default memo(ConfirmDeleteAudioModal);
