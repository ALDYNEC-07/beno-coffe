"use client";

import { useState } from "react";
import s from "./VoiceBarista.module.css";

type Phase = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "error";

const PHASE_LABELS: Record<Phase, string> = {
  idle:       "",
  connecting: "Подключаюсь...",
  listening:  "Слушаю...",
  thinking:   "Думаю...",
  speaking:   "Говорю...",
  error:      "Ошибка",
};

export default function VoiceBarista() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");

  function handleOpen() {
    setActive(true);
    setPhase("connecting");
  }

  function handleClose() {
    setActive(false);
    setPhase("idle");
  }

  return (
    <div className={`${s.pill} ${active ? s.active : ""}`}>

      {/* Idle: иконка микрофона + "Бариста" */}
      <div className={s.idleContent} onClick={!active ? handleOpen : undefined} role="button" aria-label="Открыть голосового бариста">
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
        <button className={s.closeBtn} onClick={handleClose} aria-label="Завершить разговор">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <line x1="18" y1="6"  x2="6"  y2="18" />
            <line x1="6"  y1="6"  x2="18" y2="18" />
          </svg>
        </button>
      </div>

    </div>
  );
}
