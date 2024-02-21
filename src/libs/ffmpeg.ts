import fs from 'fs-extra';
import path from 'path';
import Chalk from './chalk';
import FFMPEG from 'fluent-ffmpeg';
import ffprobe from '@ffprobe-installer/ffprobe';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { fixPathWin } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';

export const initFfmpeg = () => {
  FFMPEG.setFfmpegPath(ffmpeg.path);
  FFMPEG.setFfprobePath(ffprobe.path);
};

export class Ffmpeg {
  private probeFile(videoPath: string): Promise<FFMPEG.FfprobeData> {
    return new Promise((resolve, reject) => {
      FFMPEG.ffprobe(videoPath, (err, data) => {
        if (err) {
          Chalk.error(`Error getting probe data: ${err}`);
          return;
        }

        resolve(data);
      });
    });
  }
  public getProbeData(videoPath: string): Promise<FFMPEG.FfprobeData> {
    return this.probeFile(videoPath);
  }

  private mergeVideo(audioPath: string, videoPath: string, subtitlePath: string, outputPath: string): FFMPEG.FfmpegCommand {
    const fixSPath = fixPathWin(subtitlePath);
    const command = FFMPEG()
      .input(videoPath)
      .videoCodec('libx264')
      .input(audioPath)
      .audioCodec('libmp3lame')
      .output(outputPath)
      .outputOptions(['-preset ultrafast', '-crf 23', `-vf subtitles=${fixSPath}`,'-r 60'])

      return command
  }

  public getMergedVideo(audioPath: string, videoPath: string, subtitlePath: string, outputPath: string): FFMPEG.FfmpegCommand {
    let error = false;
    let message = '';

    if (!fs.existsSync(audioPath)) {
      message += ' Audio ';
      error = true;
    }
    if (!fs.existsSync(videoPath)) {
      message += ' Video ';
      error = true;
    }
    if (!fs.existsSync(subtitlePath)) {
      message += ' Subtitle ';
      error = true;
    }

    if (!fs.existsSync(outputPath)) {
      fs.ensureFileSync(outputPath);
    }
    if (error) {
      throw Chalk.error(`File not found: ${message}`);
    }

    return this.mergeVideo(audioPath, videoPath, subtitlePath, outputPath);
  }

  public async prepareSound(soundPath: string[], duration: number, outputPath: string) {
      const command = FFMPEG();
      soundPath.forEach((sound) => command.input(sound));
      command
        .audioCodec('libmp3lame')
        .outputOptions('-t', duration.toString())
        .output(outputPath)
        .mergeToFile(outputPath,'public')
         
    return new Promise((resolve, reject) => {
      command.on('error', (err) => {
        reject(err);
      });

      command.on('end', () => {
        resolve(true);
      });
      
      command.run();
      })
  }

  public async transcodeVideo(videoPath: string, count: number, uuidPath: string){
    return new Promise<void>((resolve, reject) => {
      const command = FFMPEG();
      Chalk.info(`Preparing video ${count}`)
      command.input(videoPath)
      command.outputOptions([
        '-c:v libx264',
        '-crf 28',
        '-preset ultrafast',
        '-profile:v main',
        '-movflags +faststart',
        '-r 24'
      ]).noAudio().output(uuidPath)
      command.on('error', (err) => {
        reject(err);
      })
      command.on('end', () => {
        Chalk.info(`Video ${count} prepared`)
        resolve()
      })
      command.run();
  })
  }

  public async prepareVideo(videoPath: string, duration: number, outputPath: string) {
    const finalCommand = FFMPEG()
    return new Promise(async (resolve, reject) => {
        Chalk.info('Starting to merge videos')
      finalCommand
        .input(videoPath)
        .inputOptions(['-f concat', '-safe 0'])
        .output(outputPath)
        .outputOptions(['-c copy', '-t', duration.toString()])
      finalCommand.on('error', (err) => {
        fs.removeSync('temp');
        fs.removeSync(videoPath);
        reject(err);
        });
      finalCommand.on('end', () => {
        Chalk.success('All videos merged')
        fs.removeSync('temp');
        fs.removeSync(videoPath);
        resolve(true);
        });
      finalCommand.run()
      })
  }

  public async generateVideo(videoPath: string, audioPath: string, outputPath: string) {
    const command = FFMPEG()
    return new Promise<void>((resolve, reject) => {
      command
        .input(videoPath)
        .input(audioPath)
        .output(outputPath)
        .outputOptions(['-c:v copy', '-c:a copy'])
      command.on('error', (err) => {
        reject(err);
      });
      command.on('end', () => {
        resolve();
      });
      command.run();
    });
  }

  // public getPreparedSound(soundPath: string[], duration: number, outputPath: string): FFMPEG.FfmpegCommand {
  //   let error = false;
  //   let message = '';

  //   soundPath.forEach((sound) => {
  //     if (!fs.existsSync(sound)) {
  //       message += ` Sound ${sound} `;
  //       error = true;
  //     }
  //   });

  //   if (!fs.existsSync(outputPath)) {
  //     fs.ensureFileSync(outputPath);
  //   }

  //   if (error) {
  //     throw Chalk.error(`File not found: ${message}`);
  //   }

  //   return this.prepareSound(soundPath, duration, outputPath);
  // }
}
