import React, { useState } from 'react';
import { Track } from '../types';
import { deleteTrack, uploadAudio, deleteAudio, replaceAudio } from '../services/api';
import AudioPlayer from './AudioPlayer';
import ConfirmDeleteTrackModal from './modals/ConfirmDeleteTrackModal';
import ConfirmDeleteAudioModal from './modals/ConfirmDeleteAudioModal';

const defaultCover = 'https://picsum.photos/300/300';

interface TrackItemProps {
  track: Track;
  onEdit: () => void;
  onDelete: () => void;
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  refreshTracks: () => void;
  addToast: (type: 'success' | 'error', message: string) => void;
  isSelectMode?: boolean;
  selectedTracks?: string[];
  setSelectedTracks?: React.Dispatch<React.SetStateAction<string[]>>;
}

const TrackItem: React.FC<TrackItemProps> = ({
  track,
  onEdit,
  onDelete,
  setTracks,
  refreshTracks,
  addToast,
  isSelectMode = false,
  selectedTracks = [],
  setSelectedTracks,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAudioDeleteModalOpen, setIsAudioDeleteModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTrack(track.id);
      setTracks((prev) => prev.filter((t) => t.id !== track.id));
      await new Promise((r) => setTimeout(r, 500)); // Затримка для оновлення
      refreshTracks();
      onDelete(); // Викликаємо callback для оновлення батьківського компонента
      setIsDeleteModalOpen(false);
      addToast('success', `Track "${track.title}" deleted`);
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to delete track');
    }
  };

  const handleDeleteAudio = async () => {
    try {
      await deleteAudio(track.id);
      setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, audioFile: null } : t)));
      await new Promise((r) => setTimeout(r, 500));
      refreshTracks();
      setIsAudioDeleteModalOpen(false);
      addToast('success', `Audio for "${track.title}" deleted`);
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to delete audio');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const valid = ['audio/mp3', 'audio/wav', 'audio/mpeg'];
    if (!valid.includes(file.type)) return addToast('error', 'Invalid file type');
    if (file.size > 10 * 1024 * 1024) return addToast('error', 'File too large');

    setIsUploading(true); // Починаємо завантаженн
    try {
      const updated = await uploadAudio(track.id, file); // Завантажуємо файл і отримуємо оновлений трек
      setTracks((prev) => prev.map((t) => (t.id === track.id ? updated : t)));
      await new Promise((r) => setTimeout(r, 500));
      refreshTracks();
      addToast('success', 'Audio uploaded');
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Upload failed');
    }
    setIsUploading(false);
  };

  const handleReplaceAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const valid = ['audio/mp3', 'audio/wav', 'audio/mpeg'];
    if (!valid.includes(file.type)) return addToast('error', 'Invalid file type');
    if (file.size > 10 * 1024 * 1024) return addToast('error', 'File too large');

    setIsReplacing(true);
    try {
      const updated = await replaceAudio(track.id, file);
      setTracks((prev) => prev.map((t) => (t.id === track.id ? updated : t)));
      await new Promise((r) => setTimeout(r, 500));
      refreshTracks();
      addToast('success', 'Audio replaced');
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Replace failed');
    }
    setIsReplacing(false);
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-4 mb-4 flex items-start gap-4 border border-gray-200 transition hover:shadow-xl">
      {isSelectMode && setSelectedTracks && (
        <input
          type="checkbox"
          checked={selectedTracks.includes(track.id)}
          onChange={() =>
            setSelectedTracks((prev) =>
              prev.includes(track.id) ? prev.filter((id) => id !== track.id) : [...prev, track.id]
            )
          }
          className="mt-2 accent-purple-600"
        />
      )}
      <img
        src={track.coverImage || defaultCover}
        alt="Cover"
        className="w-20 h-20 object-cover rounded-xl border border-gray-300"
      />
      <div className="flex-1 space-y-2">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{track.title}</h3>
          <p className="text-sm text-gray-700">{track.artist}</p>
          <p className="text-sm text-gray-500">{track.album || 'No album'}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {track.genres?.length ? (
            track.genres.map((genre, i) => (
              <span
                key={i}
                className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full"
              >
                {genre}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">No genres</span>
          )}
        </div>

        {track.audioFile ? (
          <>
            <AudioPlayer trackId={track.id} />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setIsAudioDeleteModalOpen(true)}
                className="px-3 py-1 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200"
              >
                Delete Audio
              </button>
              <label className="cursor-pointer px-3 py-1 text-sm rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleReplaceAudio}
                  className="hidden"
                  disabled={isReplacing}
                />
                {isReplacing ? 'Replacing...' : 'Replace Audio'}
              </label>
            </div>
          </>
        ) : (
          <label className="cursor-pointer inline-block px-3 py-1 mt-2 text-sm rounded bg-green-100 text-green-700 hover:bg-green-200">
            <input
              type="file"
              accept="audio/*"
              onChange={handleUpload}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? 'Uploading...' : 'Upload Audio'}
          </label>
        )}
      </div>

      <div className="flex flex-col gap-2 ml-2">
        <button
          onClick={onEdit}
          className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-sm"
        >
          Delete
        </button>
      </div>

      <ConfirmDeleteTrackModal
        isOpen={isDeleteModalOpen}
        trackTitle={track.title}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      <ConfirmDeleteAudioModal
        isOpen={isAudioDeleteModalOpen}
        trackTitle={track.title}
        onConfirm={handleDeleteAudio}
        onCancel={() => setIsAudioDeleteModalOpen(false)}
      />
    </div>
  );
};

export default TrackItem;