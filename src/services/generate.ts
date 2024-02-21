import fs from 'fs-extra';
import path from 'path';
import Chalk from 'src/libs/chalk';
import { clean } from 'src/utils/helpers';
import { prepareSoundService } from 'src/services/soundService';
import { prepareVideoService } from 'src/services/videoService';
import { generateVideo } from 'src/services/generateVideo';

const generate = async (keywords: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      await prepareSoundService();
      await prepareVideoService(undefined, keywords );
      await generateVideo();
      resolve();
    } catch (error) {
      reject(error);
    }
  })
}


export { generate };