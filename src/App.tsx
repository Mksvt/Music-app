import React, { useState, useCallback } from 'react';
import TrackList from './components/TrackList';
import TrackForm from './components/TrackForm';
import Modal from './components/Modal';
import ToastContainer from './components/ToastContainer';
import { Track, Toast } from './types';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshTracks, setRefreshTracks] = useState(0);

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const handleTrackChange = () => {
    setRefreshTracks((prev) => {
      const newValue = prev + 1;
      console.log('refreshTracks updated to:', newValue);
      return newValue;
    });
  };

  const handleEditTrackClick = (track: Track) => {
    setEditingTrack(track);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 data-testid="tracks-header" className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">Music Tracks</h1>
      <button
        data-testid="create-track-button"
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 px-4 py-2 rounded mb-4"
      >
        Create Track
      </button>
      <TrackList
        onEditTrack={handleEditTrackClick}
        refreshTrigger={refreshTracks}
        addToast={addToast}
      />
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTrack(null); }}>
        <TrackForm
          track={editingTrack}
          onSubmit={handleTrackChange}
          onClose={() => { setIsModalOpen(false); setEditingTrack(null); }}
          refreshTracks={handleTrackChange}
          addToast={addToast}
        />
      </Modal>
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default App;