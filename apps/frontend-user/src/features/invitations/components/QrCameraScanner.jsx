import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, RefreshCw } from "lucide-react";
import jsQR from "jsqr";

function playBeep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 pitch
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch {
    // AudioContext not allowed or muted
  }
}

export function extractTokenFromQr(text) {
  if (!text) return "";
  const trimmed = text.trim();
  try {
    if (trimmed.includes("token=")) {
      const url = new URL(trimmed, window.location.origin);
      return url.searchParams.get("token") || trimmed;
    }
  } catch {
    // fallback
  }
  return trimmed;
}

export default function QrCameraScanner({ onScan, disabled }) {
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // "environment" | "user"
  const [errorMsg, setErrorMsg] = useState("");
  const [lastScanned, setLastScanned] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const canvasRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const barcodeDetectorRef = useRef(null);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        // ignore
      }
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const detectLoop = useCallback(async () => {
    if (!streamRef.current) return;

    const now = performance.now();
    // Throttle QR decoding to every 120ms (~8 times/sec) so video stays silky smooth 60fps
    if (now - lastScanTimeRef.current < 120) {
      animFrameRef.current = requestAnimationFrame(detectLoop);
      return;
    }
    lastScanTimeRef.current = now;

    const video = videoRef.current;
    if (video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      // 1. Try hardware-accelerated BarcodeDetector if available
      if ("BarcodeDetector" in window) {
        if (!barcodeDetectorRef.current) {
          try {
            barcodeDetectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
          } catch {
            barcodeDetectorRef.current = null;
          }
        }

        if (barcodeDetectorRef.current) {
          try {
            const barcodes = await barcodeDetectorRef.current.detect(video);
            if (barcodes && barcodes.length > 0) {
              const token = extractTokenFromQr(barcodes[0].rawValue);
              if (token) {
                playBeep();
                setLastScanned(token);
                if (onScanRef.current) {
                  onScanRef.current(token);
                }
                setTimeout(() => {
                  if (streamRef.current) {
                    animFrameRef.current = requestAnimationFrame(detectLoop);
                  }
                }, 2000);
                return;
              }
            }
          } catch {
            // BarcodeDetector failed, fallback to jsQR below
          }
        }
      }

      // 2. Fast downscaled Canvas + jsQR fallback
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const canvas = canvasRef.current;

      // Downscale to max 380px dimension to process 8x faster in CPU
      const maxDim = 380;
      const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
      const width = Math.round(video.videoWidth * scale);
      const height = Math.round(video.videoHeight * scale);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        try {
          const imageData = ctx.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data) {
            const token = extractTokenFromQr(code.data);
            if (token) {
              playBeep();
              setLastScanned(token);
              if (onScanRef.current) {
                onScanRef.current(token);
              }
              setTimeout(() => {
                if (streamRef.current) {
                  animFrameRef.current = requestAnimationFrame(detectLoop);
                }
              }, 2000);
              return;
            }
          }
        } catch {
          // Ignore decoding errors on single frames
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(detectLoop);
  }, []);

  const startCamera = async (overrideFacing) => {
    setErrorMsg("");
    setLastScanned(null);
    stopCamera();

    const targetMode = overrideFacing || facingMode;

    try {
      let stream;
      try {
        // Try ideal facing mode (environment for back camera, user for front)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        // Fallback for laptops/desktops without rear camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setIsScanning(true);
    } catch (err) {
      console.warn("Camera start failed:", err);
      setErrorMsg(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "សូមអនុញ្ញាតសិទ្ធិប្រើប្រាស់ Camera ក្នុង Browser របស់អ្នក (Allow Camera Permission)"
          : "មិនអាចបើក Camera បានទេ សូមពិនិត្យមើលឧបករណ៍ Webcam របស់អ្នក"
      );
    }
  };

  // Attach stream to video once isScanning is active and video element is mounted
  useEffect(() => {
    if (!isScanning || !streamRef.current || !videoRef.current) return;

    const video = videoRef.current;
    let isCancelled = false;

    // Only assign srcObject if different, preventing browser from aborting in-flight play()
    if (video.srcObject !== streamRef.current) {
      video.srcObject = streamRef.current;
    }
    video.setAttribute("playsinline", "true");

    const startPlaying = async () => {
      try {
        await video.play();
        if (!isCancelled) {
          detectLoop();
        }
      } catch (err) {
        // AbortError is normal during fast component re-renders or stream changes
        if (err && err.name !== "AbortError") {
          console.warn("Video play error:", err);
        }
      }
    };

    if (video.readyState >= 2) {
      startPlaying();
    } else {
      video.onloadedmetadata = () => {
        if (!isCancelled) {
          startPlaying();
        }
      };
    }

    return () => {
      isCancelled = true;
      if (video) {
        video.onloadedmetadata = null;
      }
    };
  }, [isScanning, detectLoop]);

  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    if (isScanning) {
      startCamera(nextMode);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      padding: "18px",
      marginBottom: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#0f172a", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <Camera size={20} color="#d97706" /> ស្កេន QR Code កាមេរ៉ាផ្ទាល់ (Live QR Scanner)
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
            ប្រើកាមេរ៉ាទូរស័ព្ទ ឬកុំព្យូទ័រស្កេនធៀបភ្ញៀវពេលមកដល់មាត់រោងការ
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {isScanning && (
            <button
              type="button"
              onClick={toggleFacingMode}
              title="ប្តូរកាមេរ៉ាមុខ/ក្រោយ"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#f1f5f9",
                color: "#334155",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "8px 12px",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              <RefreshCw size={15} /> ប្តូរកាមេរ៉ា
            </button>
          )}

          {!isScanning ? (
            <button
              type="button"
              onClick={() => startCamera()}
              disabled={disabled}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#0f766e",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontWeight: 600,
                fontSize: "0.88rem",
                cursor: "pointer"
              }}
            >
              <Camera size={16} /> បើកកាមេរ៉ាស្កេន
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#ef4444",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontWeight: 600,
                fontSize: "0.88rem",
                cursor: "pointer"
              }}
            >
              <CameraOff size={16} /> បិទកាមេរ៉ា
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "12px", border: "1px solid #fecaca" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {lastScanned && (
        <div style={{
          padding: "10px 14px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          color: "#15803d",
          borderRadius: "8px",
          fontSize: "0.88rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px"
        }}>
          <CheckCircle2 size={18} color="#16a34a" /> បានស្កេន Token: <code>{lastScanned}</code> (កំពុង Check-in...)
        </div>
      )}

      {isScanning && (
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          margin: "0 auto",
          height: "320px",
          borderRadius: "12px",
          overflow: "hidden",
          background: "#0f172a",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {/* Target Scan Box Overlay */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "200px",
            height: "200px",
            border: "2px solid #22c55e",
            borderRadius: "12px",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
            pointerEvents: "none"
          }}>
            {/* Animated Laser Line (GPU hardware-accelerated) */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "#ef4444",
              boxShadow: "0 0 10px #ef4444",
              willChange: "transform",
              animation: "peLaserScan 2s infinite ease-in-out"
            }} />
          </div>

          <div style={{
            position: "absolute",
            bottom: "12px",
            left: 0,
            right: 0,
            textAlign: "center",
            color: "#ffffff",
            fontSize: "0.8rem",
            fontWeight: 600,
            textShadow: "0 1px 3px rgba(0,0,0,0.8)"
          }}>
            សូមដាក់ QR Code ក្នុងប្រអប់ដើម្បីស្កេន
          </div>
        </div>
      )}

      <style>{`
        @keyframes peLaserScan {
          0% { transform: translateY(10px); }
          50% { transform: translateY(188px); }
          100% { transform: translateY(10px); }
        }
      `}</style>
    </div>
  );
}
