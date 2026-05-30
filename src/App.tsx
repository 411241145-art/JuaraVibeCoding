import React, { useEffect, useRef, useState } from 'react';
import { TranslationResponse, LandmarkSnapshot, HandLandmarks } from './types';
import { Bot, Loader2, Video, VideoOff } from 'lucide-react';
import SibiDictionary from './components/SibiDictionary';

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [translation, setTranslation] = useState<TranslationResponse | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [history, setHistory] = useState<TranslationResponse[]>([]);
  const [cdnError, setCdnError] = useState<string | null>(null);

  // Buffering states
  const landmarksBufferRef = useRef<LandmarkSnapshot[]>([]);
  const recordingStartTimeRef = useRef<number>(Date.now());
  const cameraInstanceRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const RECORDING_INTERVAL_MS = 10000; // Sending every 10 seconds

  // Initialize MediaPipe Hands
  useEffect(() => {
    let active = true;
    let hands: any = null;
    let camera: any = null;

    if (isCameraActive) {
      // Setup MediaPipe
      // @ts-ignore
      if (!window.Hands || !window.Camera) {
        setCdnError("Kamus & sensor visual masih memuat. Silakan tunggu 3-5 detik.");
        setIsCameraActive(false);
        return;
      }
      setCdnError(null);

      // @ts-ignore
      hands = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results: any) => {
        if (!active) return;
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        if (!videoElement || !canvasElement) return;

        const canvasCtx = canvasElement.getContext('2d');
        if (!canvasCtx) return;

        // Draw video frame on canvas
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

        // Record landmarks
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          // Draw landmarks
          for (const landmarks of results.multiHandLandmarks) {
            // @ts-ignore
            window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
            // @ts-ignore
            window.drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
          }

          // Buffer landmarks to be sent off
          const timeOffset = Date.now() - recordingStartTimeRef.current;
          
          // To save payload size, let's round decimals and only keep some points, or just round.
          const roundedHands = results.multiHandLandmarks.map((hand: any) => 
            hand.map((pt: any) => ({
              x: Number(pt.x.toFixed(3)),
              y: Number(pt.y.toFixed(3)),
              z: Number(pt.z.toFixed(3))
            }))
          );

          // Sub-sample to every ~500ms to avoid huge payloads and overwhelm the LLM
          const lastSnapshot = landmarksBufferRef.current[landmarksBufferRef.current.length - 1];
          if (!lastSnapshot || timeOffset - lastSnapshot.timeOffsetMs > 500) {
            landmarksBufferRef.current.push({
              timeOffsetMs: timeOffset,
              hands: roundedHands
            });
          }
        }
        canvasCtx.restore();
      });

      if (videoRef.current) {
        // @ts-ignore
        camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
             if (active && videoRef.current && hands) {
                try {
                   await hands.send({image: videoRef.current});
                } catch (e) {
                   console.warn("MediaPipe send error:", e);
                }
             }
          },
          width: 640,
          height: 480
        });
        camera.start();
        cameraInstanceRef.current = camera;
      }

      // Set up the interval for translation
      timerRef.current = setInterval(() => {
        handleTranslateBuffer();
      }, RECORDING_INTERVAL_MS);

    } else {
      if (cameraInstanceRef.current) {
        try {
          cameraInstanceRef.current.stop();
        } catch (e) {}
        cameraInstanceRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      active = false;
      if (cameraInstanceRef.current) {
        try {
          cameraInstanceRef.current.stop();
        } catch (e) {}
        cameraInstanceRef.current = null;
      }
      if (camera) {
        try {
          camera.stop();
        } catch (e) {}
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (hands) {
        try {
          hands.close();
        } catch (e) {}
      }
    };
  }, [isCameraActive]);

  const handleTranslateBuffer = async () => {
    const buffer = [...landmarksBufferRef.current];
    // Reset buffer for the next window
    landmarksBufferRef.current = [];
    recordingStartTimeRef.current = Date.now();

    if (buffer.length === 0) {
      // No movement detected recently, do nothing
      return;
    }

    setIsTranslating(true);
    try {
      const resp = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ landmarksSequence: buffer })
      });
      if (resp.ok) {
        const data = await resp.json() as TranslationResponse;
        if (data.translation_text && data.translation_text.length > 0) {
          setTranslation(data);
          setHistory(prev => [data, ...prev].slice(0, 5)); // Keep last 5
        }
      } else {
        console.error("Translation API error:", await resp.text());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <Bot className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Stella Orbit</h1>
        </div>
        <div className="flex items-center gap-4">
          <SibiDictionary />
          <button
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isCameraActive 
                ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isCameraActive ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            {isCameraActive ? 'Stop Camera' : 'Start Translation'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Camera Feed */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative aspect-video flex items-center justify-center">
            
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4 p-6">
                <VideoOff className="w-16 h-16 opacity-50 text-slate-400" />
                <p className="text-center max-w-sm">Kamera nonaktif. Klik 'Start Translation' untuk memulai.</p>
                {cdnError && (
                  <div className="mt-4 p-3 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl text-xs text-center font-mono max-w-xs animate-pulse">
                    {cdnError}
                  </div>
                )}
              </div>
            )}

            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="absolute inset-0 opacity-0 pointer-events-none w-full h-full object-cover" 
            />
            
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className={`w-full h-full object-cover bg-black ${!isCameraActive ? 'opacity-0' : 'opacity-100'}`}
            />

            {/* Translation Overlay (Subtitle) */}
            {translation && isCameraActive && (
              <div className="absolute bottom-6 left-0 right-0 px-8 flex justify-center">
                <div className="bg-black/80 backdrop-blur-md px-6 py-4 rounded-xl border border-emerald-500/30 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
                  <p className="text-2xl md:text-3xl font-bold text-center text-white drop-shadow-md">
                    {translation.translation_text}
                  </p>
                  {translation.gesture_detected && (
                    <p className="text-emerald-400 text-xs text-center mt-2 font-mono uppercase tracking-widest opacity-80">
                      [GESTURE: {translation.gesture_detected}]
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Status indicator */}
            {isCameraActive && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full text-xs font-mono backdrop-blur-sm border border-slate-700">
                <div className={`w-2 h-2 rounded-full ${isTranslating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                {isTranslating ? 'TRANSLATING...' : 'TRACKING'}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: History & Metadata */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full shadow-2xl">
          <h2 className="text-lg font-semibold border-b border-slate-800 pb-4 mb-4 flex items-center justify-between">
            <span>Log Terjemahan</span>
            {isTranslating && <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />}
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {history.length === 0 ? (
              <p className="text-slate-500 text-sm italic text-center mt-10">Belum ada data terjemahan.</p>
            ) : (
              history.map((item, i) => (
                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                  <p className="text-slate-200 font-medium mb-2">{item.translation_text}</p>
                  <p className="text-emerald-500/80 text-xs font-mono flex gap-2">
                    <span className="text-slate-600">Gestur:</span>
                    {item.gesture_detected}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

