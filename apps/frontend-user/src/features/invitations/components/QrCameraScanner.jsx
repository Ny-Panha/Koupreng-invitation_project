import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, RefreshCw, AlertCircle } from "lucide-react";
import jsQR from "jsqr";

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
  const uiCopy = useUiCopy();
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // "environment" | "user"
  const [errorMsg, setErrorMsg] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const canvasRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const barcodeDetectorRef = useRef(null);
  const onScanRef = useRef(onScan);
  const activeSessionRef = useRef(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopCamera = useCallback(() => {
    activeSessionRef.current = false;
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
    setIsVerifying(false);
  }, []);

  const detectLoop = useCallback(async () => {
    if (!streamRef.current || !activeSessionRef.current) return;

    const now = performance.now();
    // Throttle QR decoding to every 120ms (~8 times/sec) so video stays silky smooth
    if (now - lastScanTimeRef.current < 120) {
      if (activeSessionRef.current) {
        animFrameRef.current = requestAnimationFrame(detectLoop);
      }
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
              if (token && activeSessionRef.current) {
                // Detected token: trigger verification without premature audio success
                setIsVerifying(true);
                if (onScanRef.current) {
                  onScanRef.current(token);
                }
                setTimeout(() => {
                  if (activeSessionRef.current) {
                    setIsVerifying(false);
                    animFrameRef.current = requestAnimationFrame(detectLoop);
                  }
                }, 2500);
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

      // Downscale to max 380px dimension to process faster
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

          if (code && code.data && activeSessionRef.current) {
            const token = extractTokenFromQr(code.data);
            if (token) {
              // Detected token: trigger verification without premature audio success
              setIsVerifying(true);
              if (onScanRef.current) {
                onScanRef.current(token);
              }
              setTimeout(() => {
                if (activeSessionRef.current) {
                  setIsVerifying(false);
                  animFrameRef.current = requestAnimationFrame(detectLoop);
                }
              }, 2500);
              return;
            }
          }
        } catch {
          // Ignore decoding errors on single frames
        }
      }
    }

    if (activeSessionRef.current) {
      animFrameRef.current = requestAnimationFrame(detectLoop);
    }
  }, []);

  const startCamera = async (overrideFacing) => {
    setErrorMsg("");
    setIsVerifying(false);
    stopCamera();

    // Check secure context
    if (
      typeof window !== "undefined" &&
      !window.isSecureContext &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      setErrorMsg(
        uiCopy(
          "កាមេរ៉ាតម្រូវឱ្យមានការតភ្ជាប់សុវត្ថិភាព (HTTPS)។ សូមប្រើការបញ្ចូលកូដដោយដៃខាងក្រោម។",
          "Camera scanner requires a secure context (HTTPS). Please use manual token entry below."
        )
      );
      return;
    }

    // Check browser mediaDevices support
    if (!navigator?.mediaDevices?.getUserMedia) {
      setErrorMsg(
        uiCopy(
          "ឧបករណ៍ ឬកម្មវិធីរុករកនេះមិនគាំទ្រកាមេរ៉ាទេ។ សូមប្រើប្រាស់ការបញ្ចូលកូដដោយដៃខាងក្រោម។",
          "Camera access is not supported on this browser. Please use manual token entry below."
        )
      );
      return;
    }

    const targetMode = overrideFacing || facingMode;
    activeSessionRef.current = true;

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (!activeSessionRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      setIsScanning(true);
    } catch (err) {
      activeSessionRef.current = false;
      setErrorMsg(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? uiCopy(
              "សូមអនុញ្ញាតសិទ្ធិប្រើប្រាស់ Camera ក្នុង Browser របស់អ្នក ឬប្រើការបញ្ចូលកូដដោយដៃ។",
              "Please allow camera permissions in your browser, or use manual entry below."
            )
          : uiCopy(
              "មិនអាចបើក Camera បានទេ។ សូមពិនិត្យឧបករណ៍ ឬប្រើការបញ្ចូលកូដដោយដៃ។",
              "Could not access camera. Please check your webcam or use manual entry."
            )
      );
    }
  };

  useEffect(() => {
    if (!isScanning || !streamRef.current || !videoRef.current) return;

    const video = videoRef.current;
    let isCancelled = false;

    if (video.srcObject !== streamRef.current) {
      video.srcObject = streamRef.current;
    }
    video.setAttribute("playsinline", "true");

    const startPlaying = async () => {
      try {
        await video.play();
        if (!isCancelled && activeSessionRef.current) {
          detectLoop();
        }
      } catch (err) {
        if (err && err.name !== "AbortError") {
          console.warn("Video play error:", err);
        }
      }
    };

    if (video.readyState >= 2) {
      startPlaying();
    } else {
      video.onloadedmetadata = () => {
        if (!isCancelled && activeSessionRef.current) {
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
    <div
      className="checkin-camera-panel"
      style={{
        background: "var(--app-surface, #ffffff)",
        borderRadius: "20px",
        border: "1.5px solid var(--app-border, #e8dfcf)",
        padding: "24px 28px",
        marginBottom: "24px",
        boxShadow: "0 6px 20px rgba(93, 67, 32, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h3
              style={{
                margin: 0,
                fontSize: "1.15rem",
                color: "var(--app-ink, #1f2421)",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  padding: "8px",
                  background: "rgba(176, 146, 106, 0.14)",
                  borderRadius: "12px",
                  color: "#B0926A",
                }}
              >
                <Camera size={20} />
              </span>
              {uiCopy("ស្កេនកូដតាមកាមេរ៉ា", "Live QR scanner")}
            </h3>
            {isScanning ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 700,
                  background: "#ecfdf5",
                  color: "#059669",
                  border: "1px solid #a7f3d0",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#10b981",
                    boxShadow: "0 0 8px #10b981",
                  }}
                />
                {uiCopy("កំពុងស្កេន", "Scanning live")}
              </span>
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 700,
                  background: "var(--app-subtle, #faf6ee)",
                  color: "var(--app-muted, #696053)",
                  border: "1px solid var(--app-border, #e8dfcf)",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#a89078",
                  }}
                />
                {uiCopy("រួចរាល់សម្រាប់ស្កេន", "Ready")}
              </span>
            )}
          </div>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: "13.5px",
              color: "var(--app-muted, #696053)",
              lineHeight: 1.5,
            }}
          >
            {uiCopy(
              "ប្រើកាមេរ៉ាទូរស័ព្ទ ឬកុំព្យូទ័រ ដើម្បីស្កេនកូដកាតអញ្ជើញរបស់ភ្ញៀវពេលមកដល់។",
              "Use your phone or computer camera to scan guests’ invitation QR codes on arrival."
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {isScanning && (
            <button
              type="button"
              onClick={toggleFacingMode}
              title={uiCopy("ប្តូរកាមេរ៉ាមុខ/ក្រោយ", "Switch front/back camera")}
              className="workspace-button"
              style={{
                borderRadius: "999px",
                padding: "10px 18px",
                fontWeight: 700,
                fontSize: "13.5px",
              }}
            >
              <RefreshCw size={15} /> {uiCopy("ប្តូរកាមេរ៉ា", "Switch camera")}
            </button>
          )}

          {!isScanning ? (
            <button
              type="button"
              onClick={() => startCamera()}
              disabled={disabled}
              className="workspace-button primary"
              style={{
                borderRadius: "999px",
                padding: "12px 22px",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              <Camera size={18} /> {uiCopy("បើកកាមេរ៉ាស្កេន", "Start camera scanner")}
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="workspace-button"
              style={{
                borderRadius: "999px",
                padding: "12px 22px",
                fontWeight: 700,
                fontSize: "14px",
                background: "#fef2f2",
                borderColor: "#fecaca",
                color: "#b91c1c",
              }}
            >
              <CameraOff size={18} /> {uiCopy("បិទកាមេរ៉ា", "Stop camera")}
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            background: "#fef2f2",
            color: "#b91c1c",
            borderRadius: "10px",
            fontSize: "0.88rem",
            marginBottom: "14px",
            border: "1px solid #fecaca",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {isVerifying && (
        <div
          role="status"
          style={{
            padding: "12px 18px",
            background: "linear-gradient(135deg, #fefce8, #fef9c3)",
            border: "1.5px solid #fde047",
            color: "#854d0e",
            borderRadius: "12px",
            fontSize: "0.92rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "14px",
            boxShadow: "0 2px 10px rgba(234, 179, 8, 0.15)",
          }}
        >
          <RefreshCw size={18} className="animate-spin" />
          <span>
            {uiCopy(
              "បានស្កេនកូដ — កំពុងផ្ទៀងផ្ទាត់វត្តមានជាមួយប្រព័ន្ធ...",
              "QR detected — verifying attendance with server..."
            )}
          </span>
        </div>
      )}

      {isScanning && (
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "520px",
            margin: "12px auto 0",
            height: "340px",
            borderRadius: "16px",
            overflow: "hidden",
            background: "#090d16",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {/* Target Scan Box Overlay with Luxury Reticle */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "220px",
              height: "220px",
              border: "2px solid rgba(245, 158, 11, 0.5)",
              borderRadius: "16px",
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.52)",
              pointerEvents: "none",
            }}
          >
            {/* Corner accents */}
            <div
              style={{
                position: "absolute",
                top: "-2px",
                left: "-2px",
                width: "24px",
                height: "24px",
                borderTop: "4px solid #f59e0b",
                borderLeft: "4px solid #f59e0b",
                borderTopLeftRadius: "16px",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                width: "24px",
                height: "24px",
                borderTop: "4px solid #f59e0b",
                borderRight: "4px solid #f59e0b",
                borderTopRightRadius: "16px",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-2px",
                left: "-2px",
                width: "24px",
                height: "24px",
                borderBottom: "4px solid #f59e0b",
                borderLeft: "4px solid #f59e0b",
                borderBottomLeftRadius: "16px",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "24px",
                height: "24px",
                borderBottom: "4px solid #f59e0b",
                borderRight: "4px solid #f59e0b",
                borderBottomRightRadius: "16px",
              }}
            />

            {/* Animated Laser Line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "4px",
                right: "4px",
                height: "2px",
                background: "linear-gradient(90deg, transparent, #22c55e, #10b981, transparent)",
                boxShadow: "0 0 14px #22c55e",
                willChange: "transform",
                animation: "peLaserScan 2.2s infinite ease-in-out",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(4px)",
                color: "#ffffff",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "0.82rem",
                fontWeight: 600,
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              {uiCopy("🎯 សូមដាក់កូដកាតអញ្ជើញក្នុងប្រអប់", "🎯 Place the invitation QR code inside the frame")}
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
