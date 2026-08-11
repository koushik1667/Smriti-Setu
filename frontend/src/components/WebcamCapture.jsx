import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, AlertCircle, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const WebcamCapture = ({ onCapture, isAnalyzing }) => {
  const { t } = useLanguage();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  const streamRef = useRef(null);

  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
    };
  }, [facingMode]);

  const startWebcam = async () => {
    setCameraError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Webcam permission error or missing hardware:', err.message);
      setCameraError('Webcam unavailable. You can upload an image file of the medicine package below.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(base64Image);
    stopWebcam();
    onCapture(base64Image);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result;
      setCapturedImage(base64Image);
      stopWebcam();
      onCapture(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startWebcam();
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: 'var(--r-lg)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', color: 'var(--md-sys-color-on-surface)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Camera size={20} color="var(--md-sys-color-primary)" />
            {t('scanner')}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px', margin: 0 }}>{t('positionMedicine')}</p>
        </div>

        {stream && !capturedImage && (
          <button onClick={toggleCamera} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '4px', borderRadius: 'var(--r-full)' }}>
            <RefreshCw size={14} />
            {t('switchCam')}
          </button>
        )}
      </div>

      {/* Camera Viewport / Captured Image Preview */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', maxHeight: '380px', background: '#0a0a0c', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-elevation-2)' }}>
        
        {capturedImage ? (
          <img src={capturedImage} alt="Captured Medicine" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraError ? 'none' : 'block' }}
            />

            {/* Futuristic Holographic Reticle & Laser Scanline */}
            {!cameraError && (
              <div style={{ position: 'absolute', inset: '10%', border: '2px dashed rgba(208, 188, 255, 0.4)', borderRadius: 'var(--r-md)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 9999px rgba(10, 10, 14, 0.48)' }}>
                {/* 4 HUD Corner Brackets */}
                <div style={{ position: 'absolute', top: -2, left: -2, width: '20px', height: '20px', borderTop: '3px solid var(--md-sys-color-primary)', borderLeft: '3px solid var(--md-sys-color-primary)' }} />
                <div style={{ position: 'absolute', top: -2, right: -2, width: '20px', height: '20px', borderTop: '3px solid var(--md-sys-color-primary)', borderRight: '3px solid var(--md-sys-color-primary)' }} />
                <div style={{ position: 'absolute', bottom: -2, left: -2, width: '20px', height: '20px', borderBottom: '3px solid var(--md-sys-color-primary)', borderLeft: '3px solid var(--md-sys-color-primary)' }} />
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: '20px', height: '20px', borderBottom: '3px solid var(--md-sys-color-primary)', borderRight: '3px solid var(--md-sys-color-primary)' }} />

                {/* Animated Laser Scanline */}
                <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent 0%, #10b981 30%, #38bdf8 50%, #10b981 70%, transparent 100%)', boxShadow: '0 0 12px #38bdf8, 0 0 24px #10b981', animation: 'laserScan 2.5s ease-in-out infinite' }} />

                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-on-primary-container)', background: 'var(--md-sys-color-primary-container)', padding: '5px 14px', borderRadius: 'var(--r-full)', boxShadow: 'var(--shadow-elevation-1)', opacity: 0.95 }}>
                  {t('positionMedicine')}
                </span>
              </div>
            )}
          </>
        )}

        {/* Camera Hardware Error / Fallback */}
        {cameraError && !capturedImage && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}>
            <AlertCircle size={36} color="var(--amber)" style={{ margin: '0 auto 10px auto', display: 'block' }} />
            <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>{cameraError}</p>
            <button onClick={() => fileInputRef.current?.click()} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              <Upload size={16} />
              {t('uploadFile')}
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />

      {/* Action Controls - Ergonomic Mobile Buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
        {capturedImage ? (
          <button onClick={handleRetake} className="btn-secondary" disabled={isAnalyzing} style={{ flex: 1 }}>
            <RefreshCw size={16} />
            {t('retakeScan')}
          </button>
        ) : (
          !cameraError && (
            <button onClick={handleCaptureFrame} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={isAnalyzing}>
              <Sparkles size={18} />
              {isAnalyzing ? 'Analyzing...' : t('captureAnalyze')}
            </button>
          )
        )}

        {!capturedImage && !cameraError && (
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} title={t('uploadFile')}>
            <Upload size={16} />
            <span style={{ fontSize: '0.82rem' }}>{t('uploadFile')}</span>
          </button>
        )}
      </div>

    </div>
  );
};
