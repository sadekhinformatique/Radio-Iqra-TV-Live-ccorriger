
import React, { useEffect, useRef } from 'react';
import { COLORS } from '../constants';

interface VisualizerProps {
  audioContext: AudioContext | null;
  source: MediaElementAudioSourceNode | null;
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ audioContext, source, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: Expected 1 arguments, but got 0. Initialized with null.
  const animationIdRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!audioContext || !source || !canvasRef.current) return;

    if (!analyserRef.current) {
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient based on Burkina colors
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, COLORS.GREEN);
        gradient.addColorStop(0.5, COLORS.YELLOW);
        gradient.addColorStop(1, COLORS.RED);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    if (isPlaying) {
      draw();
    } else {
      if (animationIdRef.current !== null) cancelAnimationFrame(animationIdRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationIdRef.current !== null) cancelAnimationFrame(animationIdRef.current);
    };
  }, [audioContext, source, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-32 opacity-80 rounded-lg"
      width={600}
      height={150}
    />
  );
};

export default Visualizer;
