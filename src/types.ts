export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export type HandLandmarks = Landmark[];

export interface LandmarkSnapshot {
  timeOffsetMs: number;
  hands: HandLandmarks[];
}

export interface TranslationResponse {
  gesture_detected: string;
  translation_text: string;
}
