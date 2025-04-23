import { useState, useEffect, useCallback } from 'react';
import { Track } from '../types';
import { getTracks, getGenres } from '../services/api';
import useDebounce from './useDebounce';

interface UseTrackListProps {
  refreshTrigger: number;
  addToast: (type: 'success' | 'error', message: string) => void;
}

interface TrackListState {
  tracks: Track[];
  loading: boolean;
  page: number;
  totalPages: number;
  sort: string;
  filterGenre: string;
  filterArtist: string;
  search: string;
  genres: string[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  setPage: (page: number) => void;
  setSort: (sort: string) => void;
  setFilterGenre: (genre: string) => void;
  setFilterArtist: (artist: string) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  refreshTracks: () => void;
}
// Стан для треків, завантаження, фільтрів, пагінації та жанрів
export const useTrackList = ({ refreshTrigger, addToast }: UseTrackListProps): TrackListState => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('title');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterArtist, setFilterArtist] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [genres, setGenres] = useState<string[]>([]);

  const search = useDebounce(searchInput, 500);

  // Завантаження треків з API
  const fetchTracks = useCallback(async () => {
    console.log('fetchTracks called with params:', { page, sort, filterGenre, filterArtist, search });
    setLoading(true);
    try {
      const response = await getTracks({
        page,
        sort,
        genre: filterGenre,
        artist: filterArtist,
        search,
      });
      console.log('Fetched tracks response:', response);
      setTracks(response.data);
      setTotalPages(response.meta.totalPages);
      addToast('success', 'Tracks loaded successfully');
    } catch (err) {
      console.error('Error fetching tracks:', err);
      addToast('error', 'Failed to load tracks');
    }
    setLoading(false);
  }, [page, sort, filterGenre, filterArtist, search, addToast]);
 
  
  const refreshTracks = useCallback(() => {
    fetchTracks();
  }, [fetchTracks]);

  const fetchGenres = useCallback(async () => {
    try {
      const data = await getGenres();
      setGenres(data);
    } catch (err) {
      addToast('error', 'Failed to load genres');
    }
  }, [addToast]);

  useEffect(() => {
    console.log('useEffect triggered with refreshTrigger:', refreshTrigger);
    fetchTracks();
  }, [fetchTracks, refreshTrigger]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  useEffect(() => {
    setPage(1);
  }, [search]);

   // Оновлення значення пошуку
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  return {
    tracks,
    loading,
    page,
    totalPages,
    sort,
    filterGenre,
    filterArtist,
    search: searchInput, 
    genres,
    setTracks,
    setPage,
    setSort,
    setFilterGenre,
    setFilterArtist,
    handleSearchChange,
    refreshTracks,
  };
};