const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050; // Menor tasa de muestreo para archivos más pequeños en local

function writeWavFile(filePath, durationSeconds, sampleFn) {
  const numSamples = Math.floor(SAMPLE_RATE * durationSeconds);
  const dataSize = numSamples * 2; // 16-bit = 2 bytes por muestra
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 = Mono)
  buffer.writeUInt32LE(SAMPLE_RATE, 24); // SampleRate
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // ByteRate (SampleRate * 1 channel * 2 bytes)
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample (16-bit)

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Escribir datos
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const sample = sampleFn(t, i);
    // Limitar a [-1, 1]
    const boundedSample = Math.max(-1, Math.min(1, sample));
    // Convertir a 16-bit signed integer
    const intSample = Math.floor(boundedSample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  // Asegurar que exista la carpeta
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
  console.log(`Guardado: ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// 1. Sonido de Correcto: Arpegio ascendente alegre
writeWavFile(path.join(__dirname, '../public/audio/correct.wav'), 0.6, (t) => {
  // Tres notas rápidas ascendentes (C5 -> E5 -> G5)
  let freq = 523.25; // C5
  if (t > 0.15 && t <= 0.3) freq = 659.25; // E5
  if (t > 0.3) freq = 783.99; // G5
  
  // Onda senoidal con envolvente de volumen que decae al final
  const volume = t < 0.5 ? 0.3 : 0.3 * (1 - (t - 0.5) / 0.1);
  return volume * Math.sin(2 * Math.PI * freq * t);
});

// 2. Sonido de Incorrecto: Tono descendente triste distorsionado
writeWavFile(path.join(__dirname, '../public/audio/incorrect.wav'), 0.8, (t) => {
  // Frecuencia que baja rápidamente con vibrato
  const freq = Math.max(80, 260 - t * 200) + 15 * Math.sin(2 * Math.PI * 25 * t);
  
  // Onda de sierra básica para un sonido áspero/retro
  const angle = 2 * Math.PI * freq * t;
  const rawSample = (angle % (2 * Math.PI)) / Math.PI - 1; // Onda de sierra
  const volume = 0.25 * (1 - t);
  return volume * rawSample;
});

// 3. Sonido de Tick del Reloj: Pulso seco corto
writeWavFile(path.join(__dirname, '../public/audio/tick.wav'), 0.08, (t) => {
  const freq = 1200;
  const volume = 0.2 * Math.exp(-60 * t); // Decaimiento muy rápido
  return volume * Math.sin(2 * Math.PI * freq * t);
});

// 4. Música de Lobby: Melodía chiptune alegre y repetitiva
writeWavFile(path.join(__dirname, '../public/audio/lobby.wav'), 8.0, (t, sampleIndex) => {
  // Melodía simple de 8 notas en bucle (escala de Do mayor)
  // Tiempo de cada nota: 0.25 segundos
  const melody = [523.25, 587.33, 659.25, 698.46, 783.99, 698.46, 659.25, 587.33];
  const noteIndex = Math.floor(t / 0.25) % melody.length;
  let freq = melody[noteIndex];
  
  // Añadir un bajo simple en octava baja cada 0.5 segundos
  const bassMelody = [261.63, 196.00, 220.00, 174.61];
  const bassIndex = Math.floor(t / 0.5) % bassMelody.length;
  const bassFreq = bassMelody[bassIndex];

  // Onda cuadrada para la melodía principal
  const angleMelody = 2 * Math.PI * freq * t;
  const pulseMelody = Math.sin(angleMelody) > 0 ? 0.08 : -0.08;
  
  // Onda senoidal suave para el bajo
  const bassSample = 0.15 * Math.sin(2 * Math.PI * bassFreq * t);
  
  // Añadir envolvente por nota (evitar clicks entre notas)
  const noteProgress = (t % 0.25) / 0.25;
  const noteEnvelope = noteProgress < 0.1 ? noteProgress / 0.1 : (1 - noteProgress);
  
  return (pulseMelody * noteEnvelope) + bassSample;
});

// 5. Música de Batalla: Melodía de tensión y ritmo rápido en bucle
writeWavFile(path.join(__dirname, '../public/audio/battle.wav'), 8.0, (t) => {
  // Ritmo rápido (tempo más alto: 0.18s por nota)
  // Escala menor para tensión
  const melody = [293.66, 311.13, 349.23, 392.00, 349.23, 392.00, 440.00, 392.00];
  const noteIndex = Math.floor(t / 0.18) % melody.length;
  const freq = melody[noteIndex];

  // Bajo rápido en octavas
  const bassMelody = [146.83, 146.83, 196.00, 196.00, 174.61, 174.61, 146.83, 146.83];
  const bassIndex = Math.floor(t / 0.36) % bassMelody.length;
  const bassFreq = bassMelody[bassIndex];

  // Melodía (onda de sierra con vibrato)
  const vibrato = 5 * Math.sin(2 * Math.PI * 6 * t);
  const angleMelody = 2 * Math.PI * (freq + vibrato) * t;
  const sawMelody = 0.06 * (((angleMelody % (2 * Math.PI)) / Math.PI) - 1);

  // Bajo (onda senoidal con armónicos)
  const bassSample = 0.12 * Math.sin(2 * Math.PI * bassFreq * t);

  // Envolvente de nota
  const noteProgress = (t % 0.18) / 0.18;
  const noteEnvelope = noteProgress < 0.15 ? noteProgress / 0.15 : (1 - noteProgress);

  return (sawMelody * noteEnvelope) + bassSample;
});
