import { envOrFail } from '../utils/env';

export const apiConfig = {
  geminiApi: envOrFail('GEMINI_API_KEY'),
  assemblyaiApi: envOrFail('ASSEMBLYAI_API_KEY'),
  pexelsApi: envOrFail('PEXELS_API_KEY'),
  tiktokSessionId: envOrFail('TIKTOK_SESSION_ID'),
  freesoundApi: envOrFail('FREESOUND_API_KEY'),
};
