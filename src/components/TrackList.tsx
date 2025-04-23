import React, { useState } from 'react';
import TrackItem from './TrackItem';
import Loader from './Loader';
import ConfirmBulkDeleteModal from './modals/ConfirmBulkDeleteModal.tsx';
import { useTrackList } from '../hooks/useTrackList';
import { Track } from '../types';
import { deleteTrack } from '../services/api';

interface TrackListProps {
  onEditTrack: (track: Track) => void;
  refreshTrigger: number;
  addToast: (type: 'success' | 'error', message: string) => void;
}

const TrackList: React.FC<TrackListProps> = ({ onEditTrack, refreshTrigger, addToast }) => {
  const {
    tracks,
    loading,
    page,
    totalPages,
    sort,
    filterGenre,
    filterArtist,
    search,
    genres,
    setTracks,
    setPage,
    setSort,
    setFilterGenre,
    setFilterArtist,
    handleSearchChange,
    refreshTracks,
  } = useTrackList({ refreshTrigger, addToast });

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    setPage(1);
    try {
      await refreshTracks();
    } catch (error) {
      addToast('error', 'Failed to refresh tracks');
    }
  };

  const handleBulkDelete = () => {
    if (selectedTracks.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedTracks.map(id => deleteTrack(id)));
      setTracks(prev => prev.filter(track => !selectedTracks.includes(track.id)));
      setSelectedTracks([]);
      setPage(1);
      await refreshTracks();
      addToast('success', `${selectedTracks.length} track(s) deleted`);
      setIsSelectMode(false);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      addToast('error', 'Failed to delete selected tracks');
    }
  };

  return (
    <div data-testid="track-list">
      <div className="mb-4 flex gap-4 flex-wrap">
        <button
          data-testid="select-mode-toggle"
          onClick={() => {
            setIsSelectMode(!isSelectMode);
            setSelectedTracks([]);
          }}
          className="bg-blue-500 text-gray-600 px-4 py-2 rounded hover:bg-blue-600"
        >
          {isSelectMode ? 'Cancel Selection' : 'Select Tracks'}
        </button>
        {isSelectMode && (
          <>
            <input
              data-testid="select-all"
              type="checkbox"
              checked={selectedTracks.length === tracks.length && tracks.length > 0}
              onChange={() => {
                if (selectedTracks.length === tracks.length) {
                  setSelectedTracks([]);
                } else {
                  setSelectedTracks(tracks.map(track => track.id));
                }
              }}
              className="mr-2"
            />
            <button
              data-testid="bulk-delete-button"
              onClick={handleBulkDelete}
              disabled={selectedTracks.length === 0}
              className="bg-red-500 text-gray-600 px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              Bulk Delete ({selectedTracks.length})
            </button>
          </>
        )}
        <select
          data-testid="sort-selector"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="title">Sort by Title</option>
          <option value="artist">Sort by Artist</option>
        </select>
        <select
          data-testid="genre-filter"
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
        <input
          data-testid="artist-filter"
          type="text"
          placeholder="Filter by Artist"
          value={filterArtist}
          onChange={(e) => setFilterArtist(e.target.value)}
          className="w-full sm:w-40"
        />
        <input
          data-testid="search-input"
          type="text"
          placeholder="Search tracks..."
          value={search}
          onChange={handleSearchChange}
          className="w-full sm:w-40"
        />
      </div>
      {loading ? (
        <Loader />
      ) : !Array.isArray(tracks) || tracks.length === 0 ? (
        <p data-testid="no-tracks">No tracks available</p>
      ) : (
        tracks.map((track) => (
          <TrackItem
            key={track.id}
            track={track}
            onEdit={() => onEditTrack(track)}
            onDelete={handleDelete}
            setTracks={setTracks}
            refreshTracks={refreshTracks}
            addToast={addToast}
            isSelectMode={isSelectMode}
            selectedTracks={selectedTracks}
            setSelectedTracks={setSelectedTracks}
          />
        ))
      )}
      <div data-testid="pagination" className="mt-4 flex justify-between">
        <button
          data-testid="prev-page"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="bg-gray-500 text-gray-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous Page
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          data-testid="next-page"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="bg-gray-500 text-gray-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Next Page
        </button>
      </div>
      <ConfirmBulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        tracks={tracks}
        selectedTrackIds={selectedTracks}
        onConfirm={confirmBulkDelete}
        onCancel={() => setIsBulkDeleteModalOpen(false)} 
      />
    </div>
  );
};

export default TrackList;