import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerProps {
  trackId: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ trackId }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);// Контейнер для відображення хвиль
  const waveSurferRef = useRef<WaveSurfer | null>(null);// Посилання на екземпляр WaveSurfer
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Створення нового екземпляра WaveSurfer
    const waveSurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#ccc',
      progressColor: '#854F6C',
      cursorColor: '#522B5B',
      height: 40,
      barWidth: 2,
      normalize: true,
    });

    waveSurfer.load(`http://localhost:8000/api/files/${trackId}.mp3`);

    waveSurfer.on('ready', () => {
      setIsReady(true);
      waveSurferRef.current = waveSurfer;
    });

    waveSurfer.on('play', () => {
      setIsPlaying(true);
    });

    waveSurfer.on('pause', () => {
      setIsPlaying(false);
    });

    waveSurfer.on('finish', () => {
      setIsPlaying(false);
    });

    waveSurfer.on('error', (e) => {
      console.error('Error loading audio file', e);
      setIsReady(false);
    });

    return () => {
      waveSurfer.destroy();
    };
  }, [trackId]);

  const togglePlay = () => {
    if (isReady && waveSurferRef.current) {
      waveSurferRef.current.playPause();
    }
  };

  return (
    <div data-testid={`wavesurfer-player-${trackId}`} className="my-4 ">
      <div ref={containerRef} className="w-full rounded-md overflow-hidden cursor-pointer" />
      <button
        onClick={togglePlay}
        disabled={!isReady}
        className="mt-2 px-4 py-2 bg-[#522B5B] rounded-md hover:bg-[#854F6C] disabled:opacity-50"
        data-testid={isPlaying ? `pause-button-${trackId}` : `play-button-${trackId}`}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default AudioPlayer;

