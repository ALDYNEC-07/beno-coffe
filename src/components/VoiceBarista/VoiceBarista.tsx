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

export default function VoiceBarista() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const wsRef = useRef<WebSocket | null>(null);

  async function handleOpen() {
    if (wsRef.current) return;
    setActive(true);
    setPhase("connecting");

    try {
      // 1. Получаем URL от нашего сервера
      const res = await fetch("/api/gemini-session");
      if (!res.ok) throw new Error("Failed to get session URL");
      const { url } = await res.json() as { url: string };

      // 2. Открываем WebSocket
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        // 3. Отправляем setup
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

        // 4. Setup завершён → начинаем слушать
        if (msg.setupComplete !== undefined) {
          setPhase("listening");
          return;
        }

        // Модель начала генерировать → thinking
        if (msg.serverContent?.generationComplete === false) {
          setPhase("thinking");
        }

        // Модель говорит → speaking
        if (msg.serverContent?.modelTurn?.parts?.length) {
          setPhase("speaking");
        }

        // Ход завершён → обратно слушаем
        if (msg.serverContent?.turnComplete) {
          setPhase("listening");
        }
      };

      ws.onerror = () => setPhase("error");

      ws.onclose = (event) => {
        console.log("[Barista] closed:", event.code, event.reason);
        wsRef.current = null;
        if (phase !== "idle") setPhase("error");
      };

    } catch (err) {
      console.error("[Barista] connect error:", err);
      setPhase("error");
    }
  }

  function handleClose() {
    wsRef.current?.close();
    wsRef.current = null;
    setActive(false);
    setPhase("idle");
  }

  return (
    <div className={`${s.pill} ${active ? s.active : ""}`}>

      {/* Idle: иконка микрофона + "Бариста" */}
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

      {/* Active: орб + фаза + кнопка закрыть */}
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
