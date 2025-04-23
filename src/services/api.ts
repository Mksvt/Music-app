import axios from 'axios';
import { Track, TrackInput } from '../types';

const API_URL = 'http://localhost:8000/api';

export const getTracks = async ({
  page = 1,
  sort = 'title',
  genre = '',
  artist = '',
  search = '',
}: {
  page?: number;
  sort?: string;
  genre?: string;
  artist?: string;
  search?: string;
}): Promise<{ data: Track[]; meta: { totalPages: number } }> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('sort', sort);
  
  if (genre) params.append('genre', genre);
  if (artist) params.append('artist', artist);
  if (search) params.append('search', search);
  
  const response = await axios.get(`${API_URL}/tracks`, { params });
  return response.data;
};

export const createTrack = async (track: TrackInput): Promise<Track> => {
  const response = await axios.post(`${API_URL}/tracks`, track);
  return response.data;
};

export const updateTrack = async (id: string, track: TrackInput): Promise<Track> => {
  const response = await axios.put(`${API_URL}/tracks/${id}`, track);
  return response.data;
};

export const deleteTrack = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/tracks/${id}`);
};

export const uploadAudio = async (id: string, file: File): Promise<Track> => {
  const formData = new FormData();
  formData.append('audioFile', file);
  
  const response = await axios.post(`${API_URL}/tracks/${id}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const replaceAudio = async (id: string, file: File): Promise<Track> => {
  return await uploadAudio(id, file); 
};

export const deleteAudio = async (id: string): Promise<Track> => {
  const response = await axios.delete(`${API_URL}/tracks/${id}/file`);
  return response.data;
};

export const getGenres = async (): Promise<string[]> => {
  const response = await axios.get(`${API_URL}/genres`);
  return response.data;
};

export const deleteMultipleTracks = async (trackIds: string[]): Promise<{success: string[], failed: string[]}> => {
  const response = await axios.delete(`${API_URL}/tracks/delete`, {
    data: { ids: trackIds }
  });
  return response.data;
};

export const deleteTracks = async (ids: string[]): Promise<any> => {
  const response = await axios.post(`${API_URL}/api/tracks/delete`, { ids });
  return response.data;
};