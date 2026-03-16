
import React, { useState, useRef, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    getRadioFacts().then(setFacts);
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
        if (audioRef.current) {
          audioRef.current.load();
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Playback error:", error);
        // Fallback: try to play again without visualizer if CORS is the issue
        // But for now, just log it.
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
          <div className={`absolute -inset-1.5 bg-gradient-to-r from-burkina-red via-burkina-yellow to-burkina-green rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-1000 ${isPlaying ? 'animate-pulse' : ''}`}></div>
          <img 
            src={RADIO_DATA.logo} 
            alt={RADIO_DATA.name} 
            className="relative w-32 h-32 md:w-44 md:h-44 rounded-full shadow-2xl border-4 border-[#111] object-cover bg-white p-1"
          />
          <div className="absolute -bottom-2 -right-2 bg-burkina-yellow text-black font-bold px-3 py-1 rounded-full text-sm shadow-lg border-2 border-[#111]">
            {RADIO_DATA.frequency}
          </div>
        </div>
        
        <h1 className="mt-8 text-4xl md:text-5xl font-black text-burkina-yellow tracking-tighter drop-shadow-md">
          {RADIO_DATA.name.toUpperCase()}
        </h1>
        
        <div className="mt-2 flex flex-col items-center">
          <span className="text-burkina-green font-semibold tracking-[0.2em] text-sm uppercase text-center px-4">
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
              <i className="fas fa-location-dot mr-1 text-burkina-red"></i> {RADIO_DATA.location}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-10 w-full">
            <button 
              onClick={togglePlay}
              disabled={isLoading}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.3)] relative overflow-hidden group ${
                isPlaying ? 'bg-burkina-red' : 'bg-burkina-green'
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
                <span className="text-burkina-yellow">{Math.round(volume * 100)}%</span>
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
                className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-burkina-yellow"
              />
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio 
          ref={audioRef} 
          crossOrigin="anonymous"
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => {
            const err = (e.target as HTMLAudioElement).error;
            console.error("Audio element error details:", {
              code: err?.code,
              message: err?.message
            });
          }}
        >
          <source src={RADIO_DATA.streamUrl} type="audio/mpeg" />
          <source src={RADIO_DATA.streamUrl.split('?')[0]} type="audio/mpeg" />
          <source src={RADIO_DATA.streamUrl.replace('radio.mp3', 'stream')} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </main>

      {/* Information Section (Gemini Powered) */}
      <section className="w-full max-w-4xl mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {facts.length > 0 ? facts.map((fact, idx) => (
          <div key={idx} className="bg-neutral-900/40 p-6 rounded-3xl border border-white/5 hover:border-burkina-yellow/30 hover:bg-neutral-900/60 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center mb-4 group-hover:bg-burkina-yellow/20 transition-colors">
              <i className="fas fa-star text-burkina-yellow text-sm"></i>
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
             <h4 className="text-burkina-yellow font-black uppercase tracking-widest text-xs mb-2">À PROPOS DE NOTRE MISSION</h4>
             <p className="text-xl font-bold mb-2">{RADIO_DATA.promoter}</p>
             <p className="text-neutral-400 text-sm leading-relaxed">
               Basée au cœur du Burkina Faso, RADIO IQRA TV est une station islamique dédiée à la diffusion des enseignements authentiques de l'Islam, dans un esprit de paix, de fraternité et d'éducation spirituelle.
             </p>
          </div>
          <div className="flex gap-4">
              <div className="p-3 bg-neutral-800 rounded-2xl text-burkina-yellow" title="Éducation Religieuse"><i className="fas fa-book-open text-2xl"></i></div>
              <div className="p-3 bg-neutral-800 rounded-2xl text-burkina-green" title="Soutien Communautaire"><i className="fas fa-hands-holding-circle text-2xl"></i></div>
          </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 mb-10 text-neutral-600 text-[10px] text-center flex flex-col gap-4 w-full max-w-4xl border-t border-white/5 pt-10">
        <div className="flex justify-center gap-4 md:gap-8 mb-2 flex-wrap">
          <a href="https://www.tiktok.com/@radio.iqra.tv?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="hover:text-burkina-yellow transition-colors text-lg" title="Suivez-nous sur TikTok">
            <i className="fab fa-tiktok"></i>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61571862830361" target="_blank" rel="noopener noreferrer" className="hover:text-burkina-yellow transition-colors text-lg" title="Suivez-nous sur Facebook">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://x.com/iqra_radio4578" target="_blank" rel="noopener noreferrer" className="hover:text-burkina-yellow transition-colors text-lg" title="Suivez-nous sur X">
            <i className="fab fa-x-twitter"></i>
          </a>
          <a href="https://www.instagram.com/radioiqratv_officielle?igsh=bTB1NDF6aGNtM3Uy" target="_blank" rel="noopener noreferrer" className="hover:text-burkina-yellow transition-colors text-lg" title="Suivez-nous sur Instagram">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://whatsapp.com/channel/0029Vb7gQcWBadmjd7KH3443" target="_blank" rel="noopener noreferrer" className="hover:text-burkina-yellow transition-colors text-lg" title="Rejoignez notre chaîne WhatsApp">
            <i className="fab fa-whatsapp"></i>
          </a>
          <a href="https://www.youtube.com/@RADIOIQRA-TV" target="_blank" rel="noopener noreferrer" className="hover:text-burkina-yellow transition-colors text-lg" title="Abonnez-vous à notre chaîne YouTube">
            <i className="fab fa-youtube"></i>
          </a>
          <a href="mailto:radioiqra07@gmail.com" className="hover:text-burkina-yellow transition-colors text-lg" title="Contactez-nous par e-mail">
            <i className="fas fa-envelope"></i>
          </a>
        </div>
        <div className="flex flex-col gap-1 mt-4">
          <p className="font-bold uppercase tracking-widest">© {new Date().getFullYear()} RADIO IQRA TV - LA VOIX DU SAINT CORAN</p>
          <p className="opacity-60 italic">"Iqra - L'importance de la connaissance dans l'épanouissement de la foi et de la société"</p>
        </div>
        <p className="flex items-center justify-center gap-2 mt-4 opacity-40">
          <span>Éditée avec</span>
          <span className="text-burkina-red">●</span>
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
          background: #FCD116;
          cursor: pointer;
          box-shadow: 0 0 15px rgba(252, 209, 22, 0.5);
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
