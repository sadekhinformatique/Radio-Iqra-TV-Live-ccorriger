
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import { RADIO_DATA, COLORS } from './constants';
import { getRadioFacts } from './services/geminiService';
import { RadioFact } from './types';
import Visualizer from './components/Visualizer';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [facts, setFacts] = useState<RadioFact[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [source, setSource] = useState<MediaElementAudioSourceNode | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    getRadioFacts().then(setFacts);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const initAudio = useCallback(() => {
    if (!audioContext && audioRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const src = ctx.createMediaElementSource(audioRef.current);
      src.connect(ctx.destination);
      setAudioContext(ctx);
      setSource(src);
      return ctx;
    }
    return audioContext;
  }, [audioContext]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (!isPlaying) {
      setIsLoading(true);
      const ctx = initAudio();
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
      }

      try {
        const streamUrl = RADIO_DATA.streamUrl;
        
        if (streamUrl.endsWith('.m3u8')) {
          if (Hls.isSupported()) {
            if (!hlsRef.current) {
              const hls = new Hls();
              hls.loadSource(streamUrl);
              hls.attachMedia(audioRef.current);
              hlsRef.current = hls;
            }
          } else if (audioRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            audioRef.current.src = streamUrl;
          }
        } else {
          audioRef.current.src = streamUrl;
        }

        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Playback error:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center p-4 md:p-8">
      {/* Header / Logo Section */}
      <header className="w-full max-w-4xl flex flex-col items-center mb-8">
        <div className="relative group">
          <div className={`absolute -inset-1.5 bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-600 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-1000 ${isPlaying ? 'animate-pulse' : ''}`}></div>
          <img 
            src={RADIO_DATA.logo} 
            alt={RADIO_DATA.name} 
            className="relative w-32 h-32 md:w-44 md:h-44 rounded-full shadow-2xl border-4 border-[#111] object-cover bg-white p-1"
          />
          <div className="absolute -bottom-2 -right-2 bg-amber-400 text-black font-bold px-3 py-1 rounded-full text-sm shadow-lg border-2 border-[#111]">
            {RADIO_DATA.frequency}
          </div>
        </div>
        
        <h1 className="mt-8 text-4xl md:text-5xl font-black text-amber-400 tracking-tighter drop-shadow-md text-center">
          {RADIO_DATA.name.toUpperCase()}
        </h1>
        
        <div className="mt-2 flex flex-col items-center">
          <span className="text-emerald-500 font-semibold tracking-[0.2em] text-sm uppercase text-center px-4">
            "{RADIO_DATA.slogan}"
          </span>
          <p className="text-neutral-500 text-center mt-3 max-w-lg text-sm italic">
            {RADIO_DATA.description}
          </p>
        </div>
      </header>

      {/* Main Player Card */}
      <main className="w-full max-w-xl bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-neutral-800 backdrop-blur-md">
        <div className="flex flex-col items-center gap-8">
          
          {/* Visualizer Area */}
          <div className="w-full bg-black/60 rounded-2xl p-4 min-h-[140px] flex items-center justify-center border border-white/5 relative overflow-hidden">
            {isPlaying ? (
              <Visualizer audioContext={audioContext} source={source} isPlaying={isPlaying} />
            ) : (
              <div className="text-neutral-700 flex flex-col items-center animate-fade-in">
                <i className="fas fa-tower-broadcast text-4xl mb-3 opacity-20"></i>
                <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">En attente du direct</span>
              </div>
            )}
            {/* Location Tag */}
            <div className="absolute top-2 right-3 text-[10px] uppercase font-bold text-neutral-600 tracking-widest">
              <i className="fas fa-location-dot mr-1 text-emerald-500"></i> {RADIO_DATA.location}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-10 w-full">
            <button 
              onClick={togglePlay}
              disabled={isLoading}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.3)] relative overflow-hidden group ${
                isPlaying ? 'bg-amber-500' : 'bg-emerald-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {isLoading ? (
                <i className="fas fa-circle-notch fa-spin text-3xl"></i>
              ) : isPlaying ? (
                <i className="fas fa-pause text-3xl"></i>
              ) : (
                <i className="fas fa-play text-3xl ml-1"></i>
              )}
            </button>
          </div>

          {/* Volume Control */}
          <div className="w-full flex flex-col gap-2 px-4">
             <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                <span>Volume</span>
                <span className="text-amber-400">{Math.round(volume * 100)}%</span>
             </div>
             <div className="flex items-center gap-4 text-neutral-500">
              <i className={`fas w-4 ${volume === 0 ? 'fa-volume-mute' : volume < 0.5 ? 'fa-volume-down' : 'fa-volume-up'}`}></i>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio 
          ref={audioRef} 
          crossOrigin="anonymous"
          preload="none"
        />
      </main>

      {/* Information Section (Gemini Powered) */}
      <section className="w-full max-w-4xl mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {facts.length > 0 ? facts.map((fact, idx) => (
          <div key={idx} className="bg-neutral-900/40 p-6 rounded-3xl border border-white/5 hover:border-amber-400/30 hover:bg-neutral-900/60 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center mb-4 group-hover:bg-amber-400/20 transition-colors">
              <i className="fas fa-mosque text-amber-400 text-sm"></i>
            </div>
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              {fact.title}
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-medium">
              {fact.content}
            </p>
          </div>
        )) : (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-neutral-900/40 p-6 rounded-3xl border border-white/5 animate-pulse h-40"></div>
          ))
        )}
      </section>

      {/* About Promoter Card */}
      <div className="w-full max-w-4xl mt-12 bg-neutral-900/30 p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center gap-8">
          <div className="text-center md:text-left flex-1">
             <h4 className="text-amber-400 font-black uppercase tracking-widest text-xs mb-2">À propos de la mission</h4>
             <p className="text-xl font-bold mb-2">{RADIO_DATA.promoter}</p>
             <p className="text-neutral-400 text-sm leading-relaxed">
               Radio Iqra TV est un pilier de l'éducation spirituelle au Burkina Faso. Notre mission est de porter la parole d'Allah et les enseignements du Prophète (PSL) avec clarté, rigueur et bienveillance pour l'épanouissement de toute la communauté.
             </p>
          </div>
          <div className="flex gap-4">
              <div className="p-3 bg-neutral-800 rounded-2xl text-amber-500" title="Éducation Spirituelle"><i className="fas fa-book-quran text-2xl"></i></div>
              <div className="p-3 bg-neutral-800 rounded-2xl text-emerald-500" title="Paix & Fraternité"><i className="fas fa-hands-praying text-2xl"></i></div>
          </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 mb-10 text-neutral-600 text-[10px] text-center flex flex-col gap-4 w-full max-w-4xl border-t border-white/5 pt-10">
        <div className="flex justify-center gap-8 mb-2">
          {RADIO_DATA.socials.facebook && (
            <a href={RADIO_DATA.socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors text-lg" title="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
          )}
          {RADIO_DATA.socials.tiktok && (
            <a href={RADIO_DATA.socials.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors text-lg" title="TikTok">
              <i className="fab fa-tiktok"></i>
            </a>
          )}
          {RADIO_DATA.socials.x && (
            <a href={RADIO_DATA.socials.x} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors text-lg" title="X (Twitter)">
              <i className="fab fa-x-twitter"></i>
            </a>
          )}
          {RADIO_DATA.socials.instagram && (
            <a href={RADIO_DATA.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors text-lg" title="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-bold uppercase tracking-widest">© {new Date().getFullYear()} {RADIO_DATA.name.toUpperCase()}</p>
          <p className="opacity-60 italic">"{RADIO_DATA.slogan}"</p>
        </div>
        <p className="flex items-center justify-center gap-2 mt-4 opacity-40">
          <span>Éditée avec</span>
          <span className="text-emerald-500">●</span>
          <span>Fierté au Burkina Faso</span>
        </p>
      </footer>

      {/* Custom Global Styles */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          box-shadow: 0 0 15px rgba(251, 191, 36, 0.5);
          border: 2px solid #000;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
