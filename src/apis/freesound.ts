
import { apiConfig } from 'src/config/api'
import { defaultDownloadPath, defaultSoundPath } from 'src/utils/constant'
import path from 'path'
import bun from 'bun'
import Chalk from 'src/libs/chalk'
import fs from 'fs-extra'

// const dirtemp = path.join(defaultDownloadPath, 'sounds')

// cleanFolder(dirtemp)
const cleanFolder = () => {
  fs.emptyDirSync(defaultSoundPath);
  Chalk.info('Cleaned sound folder');
}

// countFiles(dirtemp)
const countFiles = () => {
  const files = fs.readdirSync(defaultSoundPath);
  return files.length;
}

// getAllPaths(dirtemp)
const getAllPaths = () => {
  const files = fs.readdirSync(defaultSoundPath);
  return files.map(file => path.join(defaultSoundPath, file));
}

const randomCount = () => Math.floor(Math.random() * 100) + 1;

// fetch FreeSound 
const fetchSound = async (number: number = 15) => {
  if (countFiles() > number) {
    return Chalk.warning('Sound folder is full, skipping fetching sounds');
  }
  let count = randomCount();
  Chalk.info(`Fetching ${number} sounds`);
  return new Promise<void>((resolve, reject) => {
    for (let i = 0; i < number; i++) {
      const random = Math.floor(Math.random() * 115881) + 6;
      const url = `https://freesound.org/apiv2/sounds/${random}/?fields=id,url,previews&token=${apiConfig.freesoundApi}`;
      setTimeout(async () => {
        try {
          const response = await fetch(url);
          const data = await response.json();
          if (!data.previews) throw new Error('No previews found.Will try again.');
          const filePath = path.join(defaultSoundPath, `${data.id}.mp3`);
          await bun.write(filePath, await fetch(data.previews['preview-hq-mp3']));
          resolve();
        } catch (error) {
          Chalk.error(`Error fetching sound: ${error}`);
          count = randomCount();
        }
      }, count);
    }
  });
};

export { fetchSound, cleanFolder, countFiles, getAllPaths };