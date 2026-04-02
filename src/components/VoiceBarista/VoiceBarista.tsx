"use client";

import { useRef, useState } from "react";
import { buildBaristaPrompt } from "./baristaPrompt";
import s from "./VoiceBarista.module.css";

type Phase =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

const PHASE_LABELS: Record<Phase, string> = {
  idle:       "",
  connecting: "Подключаюсь...",
  listening:  "Слушаю...",
  thinking:   "Думаю...",
  speaking:   "Говорю...",
  error:      "Ошибка",
};

const MODEL = "models/gemini-2.5-flash-native-audio-latest";
const SAMPLE_RATE_IN = 16000;
const BUFFER_SIZE = 4096;

// Float32 → Int16 → base64
function encodePCM(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(int16.buffer);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export default function VoiceBarista() {
  const [active, setActive]   = useState(false);
  const [phase, setPhase]     = useState<Phase>("idle");

  const wsRef          = useRef<WebSocket | null>(null);
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const processorRef   = useRef<ScriptProcessorNode | null>(null);
  const streamRef      = useRef<MediaStream | null>(null);

  // Останавливаем микрофон и аудио-граф
  function stopMic() {
    processorRef.current?.disconnect();
    processorRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  async function startMic(ws: WebSocket) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    // iOS Safari требует resume() внутри пользовательского жеста — здесь это клик
    const ctx = new AudioContext({ sampleRate: SAMPLE_RATE_IN });
    if (ctx.state === "suspended") await ctx.resume();
    audioCtxRef.current = ctx;

    const source    = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(BUFFER_SIZE, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const pcm = encodePCM(e.inputBuffer.getChannelData(0));
      ws.send(JSON.stringify({
        realtimeInput: {
          audio: { data: pcm, mimeType: `audio/pcm;rate=${SAMPLE_RATE_IN}` },
        },
      }));
    };

    source.connect(processor);
    processor.connect(ctx.destination);
  }

  async function handleOpen() {
    if (wsRef.current) return;
    setActive(true);
    setPhase("connecting");

    try {
      const res = await fetch("/api/gemini-session");
      if (!res.ok) throw new Error("Failed to get session URL");
      const { url } = await res.json() as { url: string };

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          setup: {
            model: MODEL,
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Kore" },
                },
                languageCode: "ru-RU",
              },
            },
            systemInstruction: {
              parts: [{ text: buildBaristaPrompt() }],
            },
          },
        }));
      };

      ws.onmessage = async (event) => {
        const text =
          event.data instanceof Blob
            ? await event.data.text()
            : (event.data as string);
        const msg = JSON.parse(text);
        console.log("[Barista] msg:", msg);

        if (msg.setupComplete !== undefined) {
          // Setup готов → запускаем микрофон
          await startMic(ws);
          setPhase("listening");
          return;
        }

        if (msg.serverContent?.generationComplete === false) {
          setPhase("thinking");
        }
        if (msg.serverContent?.modelTurn?.parts?.length) {
          setPhase("speaking");
        }
        if (msg.serverContent?.turnComplete) {
          setPhase("listening");
        }
      };

      ws.onerror = () => { stopMic(); setPhase("error"); };

      ws.onclose = (event) => {
        console.log("[Barista] closed:", event.code, event.reason);
        stopMic();
        wsRef.current = null;
        if (phase !== "idle") setPhase("error");
      };

    } catch (err) {
      console.error("[Barista] connect error:", err);
      stopMic();
      setPhase("error");
    }
  }

  function handleClose() {
    stopMic();
    wsRef.current?.close();
    wsRef.current = null;
    setActive(false);
    setPhase("idle");
  }

  return (
    <div className={`${s.pill} ${active ? s.active : ""}`}>

      <div
        className={s.idleContent}
        onClick={!active ? handleOpen : undefined}
        role="button"
        aria-label="Открыть голосового бариста"
      >
        <svg className={s.micIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8"  y1="23" x2="16" y2="23" />
        </svg>
        Бариста
      </div>

      <div className={s.activeContent}>
        <div className={s.orb} data-phase={phase} />
        <span className={s.label}>{PHASE_LABELS[phase]}</span>
        <button
          className={s.closeBtn}
          onClick={handleClose}
          aria-label="Завершить разговор"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <line x1="18" y1="6"  x2="6"  y2="18" />
            <line x1="6"  y1="6"  x2="18" y2="18" />
          </svg>
        </button>
      </div>

    </div>
  );
}
