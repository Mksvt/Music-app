import React, { useCallback, memo } from 'react';
import Modal from '../Modal';

interface ConfirmDeleteTrackModalProps {
  isOpen: boolean;
  trackTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteTrackModal: React.FC<ConfirmDeleteTrackModalProps> = ({
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
      <div data-testid="confirm-dialog" className="p-6 bg-white rounded-lg shadow-lg max-w-sm mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Deletion</h2>
        <p className="mb-6 text-gray-600">Are you sure you want to delete "{trackTitle}"?</p>
        <div className="flex gap-3">
          <button
            data-testid="confirm-delete"
            onClick={handleConfirm}
            className="flex-1 bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
          >
            🗑️ Delete
          </button>
          <button
            data-testid="cancel-delete"
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

export default memo(ConfirmDeleteTrackModal);
