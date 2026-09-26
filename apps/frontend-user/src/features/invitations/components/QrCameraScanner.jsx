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

function extractTokenFromQr(text) {
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
      borderRadius: "20px",
      border: "1px solid #eadfce",
      padding: "24px 28px",
      marginBottom: "24px",
      boxShadow: "0 6px 20px rgba(93, 67, 32, 0.04)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#2a1f10", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "inline-flex", padding: "8px", background: "rgba(176, 146, 106, 0.14)", borderRadius: "12px", color: "#B0926A" }}>
                <Camera size={20} />
              </span>
              ស្កេន QR Code កាមេរ៉ាផ្ទាល់ (Live QR Scanner)
            </h3>
            {isScanning ? (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 700,
                background: "#ecfdf5",
                color: "#059669",
                border: "1px solid #a7f3d0"
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                កំពុងដំណើរការ (Scanning Live)
              </span>
            ) : (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 700,
                background: "#f5efe5",
                color: "#7d6443",
                border: "1px solid #eadfce"
              }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#a89078" }} />
                មិនទាន់បើក (Ready)
              </span>
            )}
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "13.5px", color: "#7d6443", lineHeight: 1.5 }}>
            ប្រើកាមេរ៉ាទូរស័ព្ទ ឬ Webcam កុំព្យូទ័រ ដើម្បីស្កេនកាតអញ្ជើញ QR របស់ភ្ញៀវពេលមកដល់មាត់រោងការ
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {isScanning && (
            <button
              type="button"
              onClick={toggleFacingMode}
              title="ប្តូរកាមេរ៉ាមុខ/ក្រោយ"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#f5efe5",
                color: "#7d6443",
                border: "1px solid #eadfce",
                borderRadius: "999px",
                padding: "11px 20px",
                fontWeight: 700,
                fontSize: "13.5px",
                cursor: "pointer",
                transition: "all 0.2s ease"
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
                gap: "8px",
                background: "linear-gradient(135deg, #B0926A 0%, #8c6f4b 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "999px",
                padding: "12px 24px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 6px 22px rgba(176, 146, 106, 0.35)",
                transition: "all 0.25s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #ba9c74 0%, #997c58 100%)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(176, 146, 106, 0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #B0926A 0%, #8c6f4b 100%)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 22px rgba(176, 146, 106, 0.35)";
              }}
            >
              <Camera size={18} /> បើកកាមេរ៉ាស្កេន
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#ffffff",
                border: "none",
                borderRadius: "999px",
                padding: "12px 24px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(239, 68, 68, 0.3)",
                transition: "all 0.2s ease"
              }}
            >
              <CameraOff size={18} /> បិទកាមេរ៉ា
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div style={{
          padding: "12px 16px",
          background: "#fef2f2",
          color: "#b91c1c",
          borderRadius: "10px",
          fontSize: "0.88rem",
          marginBottom: "14px",
          border: "1px solid #fecaca",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {lastScanned && (
        <div style={{
          padding: "12px 16px",
          background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
          border: "1px solid #86efac",
          color: "#15803d",
          borderRadius: "10px",
          fontSize: "0.9rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "14px",
          boxShadow: "0 2px 8px rgba(34, 197, 94, 0.12)"
        }}>
          <CheckCircle2 size={20} color="#16a34a" /> 
          <span>បានស្កេនដោយជោគជ័យ Token: <code style={{ background: "#dcfce7", padding: "2px 8px", borderRadius: "6px" }}>{lastScanned}</code> (កំពុងកត់ត្រាវត្តមាន...)</span>
        </div>
      )}

      {isScanning && (
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: "520px",
          margin: "12px auto 0",
          height: "340px",
          borderRadius: "16px",
          overflow: "hidden",
          background: "#090d16",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {/* Target Scan Box Overlay with Luxury Reticle */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "220px",
            height: "220px",
            border: "2px solid rgba(245, 158, 11, 0.5)",
            borderRadius: "16px",
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.52)",
            pointerEvents: "none"
          }}>
            {/* Corner accents */}
            <div style={{ position: "absolute", top: "-2px", left: "-2px", width: "24px", height: "24px", borderTop: "4px solid #f59e0b", borderLeft: "4px solid #f59e0b", borderTopLeftRadius: "16px" }} />
            <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "24px", height: "24px", borderTop: "4px solid #f59e0b", borderRight: "4px solid #f59e0b", borderTopRightRadius: "16px" }} />
            <div style={{ position: "absolute", bottom: "-2px", left: "-2px", width: "24px", height: "24px", borderBottom: "4px solid #f59e0b", borderLeft: "4px solid #f59e0b", borderBottomLeftRadius: "16px" }} />
            <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "24px", height: "24px", borderBottom: "4px solid #f59e0b", borderRight: "4px solid #f59e0b", borderBottomRightRadius: "16px" }} />

            {/* Animated Laser Line */}
            <div style={{
              position: "absolute",
              top: 0,
              left: "4px",
              right: "4px",
              height: "2px",
              background: "linear-gradient(90deg, transparent, #22c55e, #10b981, transparent)",
              boxShadow: "0 0 14px #22c55e",
              willChange: "transform",
              animation: "peLaserScan 2.2s infinite ease-in-out"
            }} />
          </div>

          <div style={{
            position: "absolute",
            bottom: "16px",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center"
          }}>
            <span style={{
              background: "rgba(15, 23, 42, 0.8)",
              backdropFilter: "blur(4px)",
              color: "#ffffff",
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "0.82rem",
              fontWeight: 600,
              border: "1px solid rgba(255, 255, 255, 0.15)"
            }}>
              🎯 សូមដាក់ QR Code កាតអញ្ជើញក្នុងប្រអប់
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes peLaserScan {
          0% { transform: translateY(12px); opacity: 0.6; }
          50% { transform: translateY(204px); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
