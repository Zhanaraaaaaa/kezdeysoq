
import React, { useRef, useEffect, useState } from 'react';

interface CameraViewProps {
  onCapture: (image: string) => void;
  isProcessing: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Камераға рұқсат берілмеді немесе камера табылмады.");
        console.error(err);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
      }
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center">
        <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto overflow-hidden rounded-2xl shadow-2xl border-4 border-white bg-black aspect-[4/3]">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
      />
      
      {/* Scanning effect Overlay */}
      <div className="absolute inset-0 pointer-events-none border-2 border-emerald-400 opacity-30 m-4 rounded-lg"></div>
      <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] scan-line opacity-70"></div>

      {/* Capture Button */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4">
        <button
          onClick={handleCapture}
          disabled={isProcessing}
          className={`group flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg active:scale-90 transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-50'}`}
        >
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center">
             <i className="fas fa-camera text-emerald-500 text-xl group-hover:scale-110 transition-transform"></i>
          </div>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
