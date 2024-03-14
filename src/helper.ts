import bun from 'bun';
import path from 'path';
import { existsSync, emptyDirSync, readdirSync } from "fs-extra";
import { defaultDownloadPath } from './config';
import { v4 as uuidv4 } from 'uuid';

const getExtension = (url: string) => {
  return path.extname(url.split('?')[0]);
};

const downloader = async (url: string) => {
  console.log('Downloader => Downloading', url);
  try {
    const fileName: string = path.join(defaultDownloadPath, `${uuidv4()}${getExtension(url)}`);

    const res = await fetch(url);
    const totalSize = Number(res.headers.get('content-length'));
    console.log('Downloader => Total:', totalSize);

    await bun.write(fileName, res);

    return fileName;
  } catch (error) {
    console.log('Error downloader =>', error);
  }
}

const cleaner = (path: string) => {
  console.log('Cleaner => Cleaning ', path);
  try {
    if (existsSync(path))
      emptyDirSync(path);
    else
      console.log('Cleaner => Not found', path);
  } catch (error) {
    console.log('Error cleaner =>', error);
  }
}

const counter = (dir: string) => {
  console.log('Counter => Couting ', dir);
  try {
    let result: string[] = [];
    if (existsSync(dir))
      result = readdirSync(dir);
    else 
      console.log('Counter => Not found', dir);
    
    let files: string[] = [];
    if (result.length) 
      files = result.map(file => path.join(dir, file));
    else
      console.log('Counter => No files found in', dir);

    return files;
  } catch (error) {
    console.log('Error counter =>', error);
  }
}

const timeFormatted = (amount: number, padLength: number = 2): string => amount.toString().padStart(padLength, '0');

const generateTime = (frequence: number) => (frame: number) => {
  const frameStart = frequence * frame;
  const millisec = frameStart % 1000;
  const sec = Math.floor(frameStart / 1000) % 60;
  const minutes = Math.floor(frameStart / 60000) % 60;
  const hours = Math.floor(frameStart / (60 * 60000));
  return `${timeFormatted(hours)}:${timeFormatted(minutes)}:${timeFormatted(sec)},${timeFormatted(millisec, 3)}`;
};

const convertSrt = async (fileInput: string, duration: number, fileOutput: string) => {
  const durationInMs = duration * 1000;
  const file = bun.file(fileInput);
  const text = await file.text();
  const lines = text.split(' ').filter(Boolean);
  const frequence = Math.floor(durationInMs / lines.length);
  const generateTimeForFrequence = generateTime(frequence);

  const srtLines = lines.map((line, index) => {
    return `${index + 1}
${generateTimeForFrequence(index)} --> ${generateTimeForFrequence(index + 1)}
${line}
`;
  });

  await bun.write(fileOutput, srtLines.join('\n'));
};

export { downloader, cleaner, counter, convertSrt };