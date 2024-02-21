import { fetchSound, countFiles, getAllPaths, cleanFolder } from "src/apis/freesound";
import { Ffmpeg } from "src/libs/ffmpeg";
import fs from "fs-extra";
import Chalk from "src/libs/chalk";
import path from "path";
import { getDuration } from "src/utils/helpers";

const outputPath = `public/sound.mp3`;
// destroy sound.mp3
const destroyErrorSound = () => {
  if (fs.existsSync(outputPath)) {
    fs.removeSync(outputPath);
  }
}

// delete used sound
const destroyUsedSound = (used: string[]) => {
  const files = fs.readdirSync('public/sounds');
  files.forEach(file => {
    if (used.includes(file)) {
      fs.removeSync(`public/sounds/${file}`);
    }
  })
}

/**
 * 
 * @param allPath 
 * @param duration
 * @param /true - success, false - error/
 * @returns soundPath1, soundPath2, sound
 */
const preparingSound = async (inputPath: string[], duration: number) => {
  const ffmpeg = new Ffmpeg();
  if (fs.existsSync(outputPath)) {
    destroyErrorSound();
  }
  Chalk.info(`Preparing sound for ${duration} seconds`);
  try {
    return await ffmpeg.prepareSound(inputPath, duration, outputPath);
  } catch (error) {
    Chalk.error(`Error preparing sound: ${error}`);
    return false
  }
}

/**
 * 
 * @param duration 
 * @returns list of sound path
 */
const collectRandomSound = async (duration: number) => {
  let time = duration;
  let use: string[] = [];
  let count: number = 0;
  let allPath = getAllPaths();
  if (allPath.length < 15) {
    await fetchSound(15 - allPath.length);
  }
  while (time > 0 && allPath.length > 0) {
    const soundPath = allPath[Math.floor(Math.random() * allPath.length)];
    const soundDuration = await getDuration(soundPath);
    if (soundDuration === 0) {
      await fetchSound(15);
      continue;
    }
    use.push(soundPath);
    time -= soundDuration;
    count++;
  }
  Chalk.info(`Collected ${count} sounds`);
  return use;
}

/**
 * 
 * @param duration 
 * @returns sound path
 */
export const prepareSoundService = async (duration: number = 30) => {
  let loading = true;
  let used: string[] = [];
  Chalk.info(`Preparing sound for ${duration} seconds`);
  while (loading) {
    const use = await collectRandomSound(duration);
    const result = await preparingSound(use, duration);
    if (result) {
      used = use.map((sound) => path.basename(sound));
      loading = false;
    } else {
      Chalk.warning('Error preparing sound. Retrying...');
      destroyErrorSound();
    }
  }
  Chalk.success(`Sound prepared successfully. Delete used sounds`);
  destroyUsedSound(used);
}