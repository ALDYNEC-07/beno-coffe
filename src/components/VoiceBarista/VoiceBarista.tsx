"use client";

import { useContext, useRef, useState } from "react";
import { CartContext } from "@/components/Cart/CartProvider";
import { localMenu } from "@/lib/localMenu";
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
const SAMPLE_RATE_IN  = 16000;
const SAMPLE_RATE_OUT = 24000;
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

// base64 → Int16 → Float32
function decodePCM(b64: string): Float32Array<ArrayBuffer> {
  const bin   = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const int16   = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 0x8000;
  return float32;
}

// Ищем товар по имени (регистронезависимо) и опциональному размеру
function findMenuItem(itemName: string, variantSize?: string) {
  const name = itemName.toLowerCase().trim();
  const item = localMenu.find(m => m.name?.toLowerCase().includes(name));
  if (!item) return null;

  const variants = item.variants ?? [];
  if (variants.length === 0) return null;

  // Если размер указан — ищем по нему, иначе берём первый вариант
  const variant = variantSize
    ? (variants.find(v => v.sizeName?.toLowerCase().includes(variantSize.toLowerCase())) ?? variants[0])
    : variants[0];

  return { item, variant };
}

export default function VoiceBarista() {
  const { addItem }           = useContext(CartContext);
  const [active, setActive]   = useState(false);
  const [phase, setPhase]     = useState<Phase>("idle");

  const wsRef          = useRef<WebSocket | null>(null);
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const processorRef   = useRef<ScriptProcessorNode | null>(null);
  const streamRef      = useRef<MediaStream | null>(null);
  // Очередь воспроизведения: следующий чанк стартует когда закончится предыдущий
  const playAtRef      = useRef<number>(0);

  // Воспроизводим очередной PCM-чанк от Gemini
  function playChunk(b64: string) {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const samples = decodePCM(b64);
    const buffer  = ctx.createBuffer(1, samples.length, SAMPLE_RATE_OUT);
    buffer.copyToChannel(samples, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    // Ставим в очередь — начинаем сразу после предыдущего чанка
    const now    = ctx.currentTime;
    const startAt = Math.max(now, playAtRef.current);
    source.start(startAt);
    playAtRef.current = startAt + buffer.duration;
  }

  // Останавливаем микрофон и аудио-граф
  function stopMic() {
    processorRef.current?.disconnect();
    processorRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    playAtRef.current = 0;
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
            tools: [{
              functionDeclarations: [{
                name: "add_to_cart",
                description: "Добавляет напиток или десерт в корзину заказа гостя",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    item_name:    { type: "STRING",  description: "Название товара из меню" },
                    variant_size: { type: "STRING",  description: "Размер: маленький, средний, большой и т.д." },
                    quantity:     { type: "INTEGER", description: "Количество, по умолчанию 1" },
                  },
                  required: ["item_name"],
                },
              }],
            }],
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

        // Воспроизводим аудио-чанки от Gemini
        const parts = msg.serverContent?.modelTurn?.parts ?? [];
        for (const part of parts) {
          const b64 = part?.inlineData?.data;
          if (b64) {
            setPhase("speaking");
            playChunk(b64);
          }
        }

        if (msg.serverContent?.turnComplete) {
          setPhase("listening");
        }

        // Gemini вызывает функцию add_to_cart
        if (msg.toolCall?.functionCalls?.length) {
          const responses = msg.toolCall.functionCalls.map((call: {
            id: string;
            name: string;
            args: { item_name: string; variant_size?: string; quantity?: number };
          }) => {
            let output = "";

            if (call.name === "add_to_cart") {
              const { item_name, variant_size, quantity = 1 } = call.args;
              const found = findMenuItem(item_name, variant_size);

              if (found) {
                const { item, variant } = found;
                const qty = Math.max(1, Math.floor(quantity));
                for (let i = 0; i < qty; i++) {
                  addItem({
                    id:    String(item.id),
                    name:  item.name ?? item_name,
                    price: variant.price !== null && variant.price !== undefined
                      ? Number(variant.price)
                      : null,
                  });
                }
                const sizeLabel = variant.sizeName ? ` ${variant.sizeName}` : "";
                output = `Добавлено: ${item.name}${sizeLabel}${variant.price ? `, ${variant.price}₽` : ""}${qty > 1 ? ` × ${qty}` : ""}`;
              } else {
                output = `Товар "${item_name}" не найден в меню`;
              }
            }

            return { id: call.id, response: { output } };
          });

          ws.send(JSON.stringify({
            toolResponse: { functionResponses: responses },
          }));
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
