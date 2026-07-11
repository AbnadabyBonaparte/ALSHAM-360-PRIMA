/// <reference types="vite/client" />

// Ambient module declarations for packages shipped without their own types.
declare module 'canvas-confetti' {
  const confetti: (options?: Record<string, unknown>) => Promise<null> | null;
  export default confetti;
}

declare module 'jspdf' {
  export default class jsPDF {
    constructor(...args: unknown[]);
    addImage(...args: unknown[]): jsPDF;
    addPage(...args: unknown[]): jsPDF;
    save(filename?: string): jsPDF;
    text(...args: unknown[]): jsPDF;
    setFontSize(size: number): jsPDF;
    setFont(...args: unknown[]): jsPDF;
    setTextColor(...args: unknown[]): jsPDF;
    internal: { pageSize: { getWidth(): number; getHeight(): number } };
  }
}

declare module 'html2canvas' {
  const html2canvas: (element: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
  export default html2canvas;
}

// Minimal Web Speech API typings — absent from the bundled lib.dom for this target.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  readonly [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare var SpeechRecognition: { new (): SpeechRecognition };
declare var webkitSpeechRecognition: { new (): SpeechRecognition };
