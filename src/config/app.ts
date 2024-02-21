import { env } from '../utils/env';

function getAppPath() {
  let currentDir = import.meta.dir

  return currentDir.replace('config', '')
}

export const appConfig = {
  isProduction: env('NODE_ENV') === 'production',
  isDevelopment: env('NODE_ENV') === 'development',
  name: env('APP_NAME'),
  version: env('APP_VERSION'),
  port: Number(env('APP_PORT')),
  url: env('APP_URL'),
  path: getAppPath(),
};
