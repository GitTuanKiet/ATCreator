import { Ffmpeg } from "src/libs/ffmpeg";
import fs from "fs-extra";
import bun from 'bun'
import Chalk from "src/libs/chalk";
import path from "path";
import { getAllPaths, downloadVideo } from "src/services/fetchVideo";
import { getDuration } from "src/utils/helpers";
import { v4 as uuidv4 } from "uuid";

const outputPath = `public/video.mp4`;

// get random video path
const collectRandomVideo = async (allPath: string[], duration: number, keywords: string) => {
  let time = duration;
  let use: string[] = [];
  let count: number = 0;
  while (time > 0 && allPath.length > 0) {
    const random = Math.floor(Math.random() * allPath.length);
    const video = allPath[random];
    const videoDuration = await getDuration(video);
    if (videoDuration === 0) {
      await downloadVideo(5, keywords);
      continue;
    }
    time -= videoDuration;
    use.push(video);
    count++;
    }
  Chalk.info(`Collecting video ${count}`);
  return use;
}

// destroy used video
const destroyUsedVideo = (used: string[]) => {
  const folders = fs.readdirSync('public/temp');
  folders.forEach(folder => {
      if (used.includes(folder)) {
        fs.removeSync(`public/temp/${folder}`);
      }
  })
}

// destroy error video
const destroyErrorVideo = () => {
  if (fs.existsSync(outputPath)) {
    fs.removeSync(outputPath);
  }
}

/**
 * 
 * @param allPath 
 * @param duration
 * @param /true - success, false - error/
 * @returns videoPath1, videoPath2, video
 */
const preparingVideo = async (inputPath: string[], duration: number) => {
  const ffmpeg = new Ffmpeg();
  if (fs.existsSync(outputPath)) {
    destroyUsedVideo([outputPath]);
  }
  let uuidPath: string[] = [];
    for (let i = 0; i < inputPath.length; i++) {
      if (!fs.existsSync('temp')) {
        fs.ensureDirSync('temp');
      }
      const uuid = uuidv4();
      const newPath = path.join('temp', `${uuid}.mp4`);
      uuidPath.push(newPath);
    }
  Chalk.info(`Preparing video for ${duration} seconds`);
  try {
    const concatFilePath = 'concat.txt'
    const fileList = uuidPath.map((path) => `file '${path}'`).join('\n');
    bun.write(concatFilePath, fileList);
    for (let i = 0; i < inputPath.length; i++) {
      await ffmpeg.transcodeVideo(inputPath[i], i + 1, uuidPath[i]);
    }
    return await ffmpeg.prepareVideo(concatFilePath, duration, outputPath);
  } catch (error) {
    Chalk.error(`Error preparing video: ${error}`);
    return false
  }
}

/**
 * 
 * @param duration 
 * @returns video path
 */
export const prepareVideoService = async (duration: number = 30, keywords: string) => {
  let loading = true;
  let used: string[] = [];
  let allPath = getAllPaths();
  if (allPath.length < 5) {
    await downloadVideo(5 - allPath.length, keywords);
  }
  Chalk.info(`Preparing video for ${duration} seconds`);
  while (loading) {
    const use = await collectRandomVideo(allPath, duration, keywords);
    const result = await preparingVideo(use, duration);
    if (result) {
      used = use.map((video) => path.dirname(video).split('/').pop() as string);
      loading = false;
    } else {
      Chalk.warning('Error preparing video. Retrying...');
      destroyErrorVideo();
    }
  }
  Chalk.success(`Video prepared successfully. Delete used videos`);
  destroyUsedVideo(used);
}