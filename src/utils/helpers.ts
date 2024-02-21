import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import Chalk from 'src/libs/chalk';
import { defaultDownloadPath, defaultOutputPath } from './constant';
import { Ffmpeg } from 'src/libs/ffmpeg';

/**
 * 
 * @param path 
 * @returns duration
 */
const getDuration = async (path: string) => {
  try {
    if (!fs.existsSync(path)) throw new Error('File not found');
    const ffmpeg = new Ffmpeg();
    const data = await ffmpeg.getProbeData(path);
    return Number(data.streams[0].duration);
  } catch (error) {
    Chalk.error(`Error getting duration: ${error}`);
    return 0;
  }
}

// Clean up the download and output directory
const clean = async () => {
  try {
    Chalk.warning('Cleaning up the download and output directory');
    await Promise.all([fs.remove(defaultDownloadPath), fs.remove(defaultOutputPath)]);
    Chalk.success('Cleaned up the download and output directory');
  } catch (error) {
    Chalk.error(error);
  }
};

// Get the file extension
const getExtension = (url: string): string => {
  return path.extname(url.split('?')[0] as string);
};

// Create a file name based on the file extension
const createFileName = (ext: string): string => {
  let fileName = 'file';
  if (['.mp3', '.wav', '.flac', '.ogg'].includes(ext)) fileName = 'audio';
  if (['.mp4', '.avi', '.mov', '.wmv'].includes(ext)) fileName = 'video';
  if (['.jpg', '.png', '.jpeg', '.gif'].includes(ext)) fileName = 'image';
  return fileName;
};

// Fix the path in Windows
const fixPathWin = (subtitlePath: string) => {
  if (os.platform() === 'win32') {
    subtitlePath = subtitlePath.replace(/\\/g, '/');
    const index = subtitlePath.indexOf(':');
    subtitlePath = subtitlePath.slice(0, index) + '\\\\' + subtitlePath.slice(index);
  }
  return subtitlePath;
};

function validTextChat(answer: string): string {
  answer = answer.replace(/[^a-zA-Z0-9\s\n]/g, '');
  answer = answer.trim();
  return answer;
}
export { clean, getExtension, createFileName, fixPathWin, validTextChat, getDuration};
