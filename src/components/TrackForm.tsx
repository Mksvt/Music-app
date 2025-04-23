import React, { useState, useEffect, useCallback, memo } from 'react';
import { Track, TrackInput } from '../types';
import { createTrack, updateTrack, getGenres } from '../services/api';

interface TrackFormProps {
  track?: Track | null;
  onSubmit: () => void;
  onClose: () => void;
  setTracks?: React.Dispatch<React.SetStateAction<Track[]>>;
  refreshTracks?: () => void;
  addToast: (type: 'success' | 'error', message: string) => void;
}

const TrackForm: React.FC<TrackFormProps> = ({ track, onSubmit, onClose, setTracks, refreshTracks, addToast }) => {
  const [data, setData] = useState<TrackInput>({ // Стейт для зберігання даних форми
    title: track?.title || '',
    artist: track?.artist || '',
    album: track?.album || '',
    genres: track?.genres || [],
    coverImage: track?.coverImage || '',
  });
  const [errors, setErrors] = useState({ // Стейт для зберігання помилок
    title: '',
    artist: '',
    coverImage: '',
    genres: '',
  });
  const [genresList, setGenresList] = useState<string[]>([]);
  const [newGenre, setNewGenre] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const fetchGenres = useCallback(async () => {
    try {
      const genres = await getGenres();
      console.log('Fetched genres:', genres);
      setGenresList(genres);
    } catch (err) {
      addToast('error', 'Failed to load genres');
    }
  }, [addToast]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  // Функція для валідації даних форми
  const validate = useCallback(() => {
    const newErrors = { title: '', artist: '', coverImage: '', genres: '' };
    let isValid = true;

    if (!data.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    if (!data.artist.trim()) {
      newErrors.artist = 'Artist is required';
      isValid = false;
    }
    if (data.coverImage && !/^https?:\/\//.test(data.coverImage)) {
      newErrors.coverImage = 'Invalid URL format';
      isValid = false;
    }
    if (data.genres.length === 0) {
      newErrors.genres = 'At least one genre is required';
      isValid = false;
    }
    if (data.genres.length > 0) {
      const invalidGenres = data.genres.filter((genre) => !genresList.includes(genre));
      if (invalidGenres.length > 0) {
        newErrors.genres = `Invalid genres: ${invalidGenres.join(', ')}`;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [data, genresList]);

   // Функція для обробки змін в полях вводу
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prevData => ({ ...prevData, [name]: value }));
    setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
  }, []);

  const handleGenreAdd = useCallback(() => {
    if (newGenre && genresList.includes(newGenre) && !data.genres.includes(newGenre)) {
      setData(prevData => ({ ...prevData, genres: [...prevData.genres, newGenre] }));
      setNewGenre('');
      setErrors(prevErrors => ({ ...prevErrors, genres: '' }));
    } else if (newGenre && !genresList.includes(newGenre)) {
      setErrors(prevErrors => ({ ...prevErrors, genres: `Genre "${newGenre}" is not available` }));
    }
  }, [newGenre, genresList, data.genres]);

  const handleGenreRemove = useCallback((genre: string) => {
    setData(prevData => ({ ...prevData, genres: prevData.genres.filter((g: string) => g !== genre) }));
    setErrors(prevErrors => ({ ...prevErrors, genres: '' }));
  }, []);

   // Підготовка даних перед відправкою на сервер
  const prepareDataForBackend = useCallback((input: TrackInput): TrackInput => {
    return {
      title: input.title,
      artist: input.artist,
      album: input.album || undefined, 
      genres: input.genres,
      coverImage: input.coverImage || undefined, 
    };
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const backendData = prepareDataForBackend(data);
      console.log('Sending data to backend:', backendData);
      if (track) { // Якщо редагуємо трек, оновлюємо його
        console.log('Attempting to update track with ID:', track.id, 'and data:', backendData);
        const updatedTrack = await updateTrack(track.id, backendData);
        if (setTracks) {
          setTracks((prevTracks) =>
            prevTracks.map((t) => (t.id === track.id ? { ...t, ...updatedTrack } : t))
          );
        }
        addToast('success', `Track "${data.title}" updated`);
      } else {
        console.log('Attempting to create track with data:', backendData);
        const newTrack = await createTrack(backendData);
        if (setTracks) {
          setTracks((prevTracks) => [...prevTracks, newTrack]);
        }
        addToast('success', `Track "${data.title}" created`);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));  // Пауза для оновлення списку треків
      if (refreshTracks) {
        refreshTracks();
      }
      onSubmit();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save track';
      console.error('Save track error:', err.response?.data || err.message);
      addToast('error', errorMessage);
    }
    setIsSubmitting(false);
  }, [track, data, validate, prepareDataForBackend, onSubmit, onClose, setTracks, refreshTracks, addToast]);

  const handleNewGenreChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewGenre(e.target.value);
  }, []);

  return (
    <div
      data-testid="track-form"
      className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-2xl max-w-md mx-auto transform transition-all duration-300 scale-95 hover:scale-100"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b-2 border-indigo-200 pb-2">
        {track ? 'Edit Track' : 'Create Track'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
            Title
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18m-9-9v18" />
              </svg>
            </span>
            <input
              data-testid="input-title"
              type="text"
              name="title"
              id="title"
              placeholder="Enter track title"
              value={data.title}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition bg-white"
            />
          </div>
          {errors.title && (
            <span data-testid="error-title" className="text-red-500 text-sm mt-1">
              {errors.title}
            </span>
          )}
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="artist">
            Artist
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <input
              data-testid="input-artist"
              type="text"
              name="artist"
              id="artist"
              placeholder="Enter artist name"
              value={data.artist}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition bg-white"
            />
          </div>
          {errors.artist && (
            <span data-testid="error-artist" className="text-red-500 text-sm mt-1">
              {errors.artist}
            </span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="album">
            Album (Optional)
          </label>
          <input
            data-testid="input-album"
            type="text"
            name="album"
            id="album"
            placeholder="Enter album name"
            value={data.album}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="coverImage">
            Cover Image URL (Optional)
          </label>
          <input
            data-testid="input-cover-image"
            type="url"
            name="coverImage"
            id="coverImage"
            placeholder="Enter image URL"
            value={data.coverImage}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition bg-white"
          />
          {errors.coverImage && (
            <span data-testid="error-cover-image" className="text-red-500 text-sm mt-1">
              {errors.coverImage}
            </span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Genres
          </label>
          <div data-testid="genre-selector" className="flex flex-wrap gap-2 mb-3">
            {data.genres.map((genre) => (
              <span
                key={genre}
                className="bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm flex items-center"
              >
                {genre}
                <button
                  type="button"
                  onClick={() => handleGenreRemove(genre)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {errors.genres && (
            <span data-testid="error-genres" className="text-red-500 text-sm mb-2 block">
              {errors.genres}
            </span>
          )}
          <div className="flex gap-2">
            <select
              value={newGenre}
              onChange={handleNewGenreChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition bg-white"
            >
              <option value="">Select Genre</option>
              {genresList.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleGenreAdd}
              className="bg-indigo-500 px-4 py-2 rounded-md hover:bg-indigo-600 transition"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            data-testid="submit-button"
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white px-4 py-2 rounded-md hover:from-indigo-600 hover:to-indigo-800 transition disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-gray-500 to-gray-700 text-white px-4 py-2 rounded-md hover:from-gray-600 hover:to-gray-800 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default memo(TrackForm);