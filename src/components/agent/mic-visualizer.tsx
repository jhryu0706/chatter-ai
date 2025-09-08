"use client";

import { useEffect, useRef } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";

type MicSpectrumProps = {
  stream: MediaStream | null;
  height?: number; // px
  width?: number; // px
};

export default function MicSpectrum({
  stream,
  height = 120,
  width = 320,
}: MicSpectrumProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const amRef = useRef<AudioMotionAnalyzer | null>(null);
  const srcNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null); // if we grab our own mic

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const am = new AudioMotionAnalyzer(el, {
      height,
      width,
      overlay: true,
      showBgColor: false,
      bgAlpha: 0,
      mode: 6,
      ansiBands: true,
      outlineBars: false,
      ledBars: false,
      lumiBars: false,
      alphaBars: false,
      fillAlpha: 1,
      lineWidth: 0,
      barSpace: 0.2,
      fftSize: 2048,
      showScaleX: false,

      // remove peak hold/decay effects
      showPeaks: false,
      peakHoldTime: 0,
      fadePeaks: true,

      minFreq: 150, // ignore < 100 Hz (AC/handling noise)
      maxFreq: 8000, // ignore > 8 kHz (air/hiss); raise if you want more sparkle
      smoothing: 0.7,

      connectSpeakers: false,
    });

    // ✅ Register custom gradient first
    // (Most versions accept either an array of colors OR a colorStops object)
    // Easiest: array of colors (both black)
    am.registerGradient("monoBlack", {
      colorStops: ["#000", "#000"],
    });

    // Now apply it
    am.setOptions({ gradient: "monoBlack" });

    amRef.current = am;

    const connectStream = (s: MediaStream) => {
      const src = am.audioCtx.createMediaStreamSource(s);
      srcNodeRef.current = src;
      am.connectInput(src);
    };

    if (stream) {
      connectStream(stream);
    } else {
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        .then((s) => {
          localStreamRef.current = s;
          connectStream(s);
        })
        .catch(console.error);
    }

    return () => {
      try {
        if (srcNodeRef.current) am.disconnectInput(srcNodeRef.current);
      } catch {}
      try {
        am.destroy();
      } catch {}
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      amRef.current = null;
      srcNodeRef.current = null;
    };
  }, [stream, height, width]);

  return (
    <div
      ref={containerRef}
      className="rounded-md overflow-hidden"
      aria-label="Live spectrum"
    />
  );
}
