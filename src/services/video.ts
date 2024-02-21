import { getExtension } from '../utils/helpers';
import path from 'path';
import fs from 'fs-extra';

import { multiBar } from 'src/libs/cliProgress';
import Chalk from '../libs/chalk';
import { downloadVideo } from './fetchVideo';
import GeMini from '../apis/gemini';
import { createAudioFile as google } from '../libs/google-tts';
import { createAudioFile as tiktok } from '../libs/tiktok-tts';
import { Ffmpeg } from '../libs/ffmpeg';
import { convertSrt } from '../utils/convertSrt';
import { defaultOutputPath, defaultDownloadPath } from '../utils/constant';
import { validTextChat } from '../utils/helpers';

export async function generateVideo() {
  const listData: Array<any> = await downloadVideo(10, 'hello') as Array<any>;

  if (listData.length > 0) {
    const genmini = new GeMini();
    Chalk.info('Start generating...');
    for (const item of listData) {
      let text = await genmini.ProVisions(`DURATION:${item.duration} seconds`, item.pathImage, 'image/jpeg');
      if (!text) {
        Chalk.error('Error generating text');
        return;
      }
      text = validTextChat(text as string);
      const dir = path.join(defaultDownloadPath, item.id.toString());
      const fileText = path.join(dir, 'text.txt');
      const fileSrt = path.join(dir, 'subtitle.srt');
      const outputFilePath = path.join(defaultOutputPath, `${item.id}.mp4`);
      item.outputFilePath = outputFilePath;
      fs.writeFileSync(fileText, text as string);
      item.pathText = fileText;
      convertSrt(fileText, item.duration, fileSrt);
      item.pathSrt = fileSrt;
      let filePath = await tiktok(text as string, path.join(dir, 'audio.mp3'), 'en_male_jomboy');
      if (!filePath) {
        filePath = await google(text as string, path.join(dir, 'audio.mp3'), 'en');
        if (!filePath) {
          Chalk.error('Error generating audio');
          return;
        }
      }
      item.pathAudio = filePath;
    }
    Chalk.success('Generated text and audio');
  }

  if (listData.length === 0) {
    Chalk.error('No video downloaded');
    return;
  }
  listData.forEach((video) => {
    // const inputs = [video.pathVideo, video.pathAudio];
    // await mergeVideo(inputs, video.outputFilePath, {
    //   subtitle: video.pathSrt
    // });
    // Chalk.success(`Video ${video.id} generated`);
    const ffmpeg = new Ffmpeg();
    const command = ffmpeg.getMergedVideo(video.pathAudio, video.pathVideo, video.pathSrt, video.outputFilePath);

    if (!command) return;

    const bar = multiBar.create(100, 0, { fileName: video.id });

    command.on('progress', (progress) => {
      bar.update(Math.round(progress.percent));
    });

    command.on('end', () => {
      bar.update(100)
      bar.stop()
    });

    command.on('error', (err) => {
      bar.stop();
      Chalk.error('\n' + err);
    });

    command.run();
  });
}
