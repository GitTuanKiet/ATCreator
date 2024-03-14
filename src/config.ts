import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

function env(key: string, defaultValue: null | string = null): string {
  return process.env[key] ?? (defaultValue as string);
}

function envOrFail(key: string): string {
  if (typeof process.env[key] === 'undefined') {
    throw new Error(`Environment variable ${key} is not set.`);
  }

  return process.env[key] as string;
}

function getAppPath() {
  let currentDir = import.meta.dir

  return currentDir
}

const config = {
  appPath: getAppPath(),
  geminiApi: envOrFail('GEMINI_API_KEY'),
  openaiApi: env('OPENAI_API_KEY'),
  assemblyaiApi: env('ASSEMBLYAI_API_KEY'),
  pexelsApi: envOrFail('PEXELS_API_KEY'),
  tiktokSessionId: env('TIKTOK_SESSION_ID'),
  freesoundApi: envOrFail('FREESOUND_API_KEY'),
};

const defaultDownloadPath = path.join('public', 'tmp');


export { config, defaultDownloadPath };
