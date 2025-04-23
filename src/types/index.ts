export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genres: string[];
  coverImage?: string;
  //audioFile?: string;
  audioFile?: string | null;
}
  
export interface TrackInput {
  title: string;
  artist: string;
  album?: string;
  genres: string[];
  coverImage?: string;
}
  
export interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}