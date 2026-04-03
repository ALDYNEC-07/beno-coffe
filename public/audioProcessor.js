/**
 * AudioWorklet processor — работает в отдельном аудио-потоке браузера.
 * Буферизует входящие сэмплы, конвертирует Float32 → Int16
 * и отправляет чанки в основной поток через port.
 */

const BUFFER_SIZE = 4096;

class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = new Float32Array(BUFFER_SIZE);
    this._index = 0;
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;

    for (let i = 0; i < channel.length; i++) {
      this._buffer[this._index++] = channel[i];

      if (this._index >= BUFFER_SIZE) {
        const int16 = new Int16Array(BUFFER_SIZE);
        for (let j = 0; j < BUFFER_SIZE; j++) {
          const s = Math.max(-1, Math.min(1, this._buffer[j]));
          int16[j] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        // Transferable — без копирования данных
        this.port.postMessage(int16.buffer, [int16.buffer]);
        this._index = 0;
      }
    }

    return true; // держим процессор живым
  }
}

registerProcessor("pcm-processor", PCMProcessor);
