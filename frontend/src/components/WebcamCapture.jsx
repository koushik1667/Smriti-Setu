import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export const WebcamCapture = ({ onCapture, isAnalyzing }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'

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
    stopWebcam(); // Turn off camera stream track after taking image
    onCapture(base64Image);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result;
      setCapturedImage(base64Image);
      stopWebcam(); // Turn off camera if active
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
    <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--md-sys-color-on-surface)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Camera size={22} color="var(--md-sys-color-primary)" />
            Webcam Scanner
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px' }}>Align medicine bottle, blister pack, or label within target box</p>
        </div>

        {stream && !capturedImage && (
          <button onClick={toggleCamera} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
            <RefreshCw size={15} />
            Switch Cam
          </button>
        )}
      </div>

      {/* Camera Viewport / Captured Image Preview */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#1c1b1f', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-elevation-1)' }}>
        
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

            {/* Target Reticle Overlay */}
            {!cameraError && (
              <div style={{ position: 'absolute', inset: '12%', border: '2px dashed var(--md-sys-color-primary-container)', borderRadius: 'var(--r-lg)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 9999px rgba(28, 27, 31, 0.45)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--md-sys-color-on-primary-container)', background: 'var(--md-sys-color-primary-container)', padding: '6px 16px', borderRadius: 'var(--r-full)', boxShadow: 'var(--shadow-elevation-1)' }}>
                  Position Medicine Label Here
                </span>
              </div>
            )}
          </>
        )}

        {/* Camera Hardware Error / Fallback */}
        {cameraError && !capturedImage && (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}>
            <AlertCircle size={44} color="var(--amber)" style={{ margin: '0 auto 14px auto', display: 'block' }} />
            <p style={{ fontSize: '0.92rem', marginBottom: '20px' }}>{cameraError}</p>
            <button onClick={() => fileInputRef.current?.click()} className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
              <Upload size={18} />
              Upload Medicine Image File
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />

      {/* Action Controls */}
      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
        {capturedImage ? (
          <button onClick={handleRetake} className="btn-secondary" disabled={isAnalyzing}>
            <RefreshCw size={18} />
            Retake / Scan Another
          </button>
        ) : (
          !cameraError && (
            <button onClick={handleCaptureFrame} className="btn-primary" style={{ width: '100%', maxWidth: '340px' }} disabled={isAnalyzing}>
              <Sparkles size={20} />
              Capture & Analyze Medicine
            </button>
          )
        )}

        {!capturedImage && !cameraError && (
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">
            <Upload size={18} />
            Upload File
          </button>
        )}
      </div>

    </div>
  );
};
