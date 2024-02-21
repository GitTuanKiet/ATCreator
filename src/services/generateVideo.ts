import { multiBar } from 'src/libs/cliProgress';
import Chalk from '../libs/chalk';
import { Ffmpeg } from '../libs/ffmpeg';

const audioPath = 'public/sound.mp3';
const videoPath = 'public/video.mp4';
// const subtitlePath = 'public/subtitle.srt';
const outputPath = 'public/output.mp4';
export async function generateVideo() {
  const ffmpeg = new Ffmpeg();
  await ffmpeg.generateVideo(audioPath, videoPath, outputPath);
  Chalk.success('Video generated. Check public/output.mp4');
}
