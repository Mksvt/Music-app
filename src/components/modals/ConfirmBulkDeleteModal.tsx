import React, { useMemo, useCallback } from 'react';
import { Track } from '../../types';

interface ConfirmBulkDeleteModalProps {
  isOpen: boolean;
  tracks: Track[];
  selectedTrackIds: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmBulkDeleteModal: React.FC<ConfirmBulkDeleteModalProps> = React.memo(({
  isOpen,
  tracks,
  selectedTrackIds,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const selectedTracks = useMemo(() => {
    return tracks.filter((track) => selectedTrackIds.includes(track.id));
  }, [tracks, selectedTrackIds]);

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <div
      data-testid="confirm-dialog"
      className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Confirm Bulk Deletion</h2>
        <p className="mb-4">
          Are you sure you want to delete the following {selectedTracks.length} track(s)?
        </p>
        <ul className="mb-4 max-h-40 overflow-y-auto">
          {selectedTracks.map((track) => (
            <li key={track.id} className="py-1">
              {track.title} by {track.artist}
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-2">
          <button
            data-testid="cancel-delete"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            data-testid="confirm-delete"
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

export default ConfirmBulkDeleteModal;
