import ffmpeg from 'fluent-ffmpeg';
import FFPROBE from '@ffprobe-installer/ffprobe';
import FFMPEG from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(FFMPEG.path);
ffmpeg.setFfprobePath(FFPROBE.path);

const getFileData = (videoPath: string) => {
  return new Promise((resolve, reject) => {
   ffmpeg.ffprobe(videoPath, (err, data) => {
    if (err) {
      console.log('Error getFileData =>', err);
      reject(err);
    }
     resolve(data);
   })
  })
}
  
const transcodeAudio = (audioPath: string, outputPath: string): Promise<string> => {
  const command = ffmpeg();
  command
    .input(audioPath)
    .outputOptions(['-c:a libmp3lame'])
    .save(outputPath)

  return new Promise((resolve, reject) => {
    command.on('error', (err) => {
      console.log('Error transcodeAudio =>', err);
      reject(err);
    });
    command.on('end', () => {
      console.log('transcodeAudio => Done');
      resolve(outputPath);
    });
    command.run();
  })
}

const transcodeVideo = (videoPath: string, outputPath: string): Promise<string> => {
  const command = ffmpeg();
  command
    .input(videoPath)
    .outputOptions(['-c:v libx264'])
    .save(outputPath)

  return new Promise((resolve, reject) => {
    command.on('error', (err) => {
      console.log('Error transcodeVideo =>', err);
      reject(err);
    });
    command.on('end', () => {
      console.log('transcodeVideo => Done');
      resolve(outputPath);
    });
    command.run();
  })
}

const prepare = (concatPath: string, duration: number, outputPath: string): Promise<string> => {
  const command = ffmpeg()

  command
    .input(concatPath)
    .inputOptions(['-f concat', '-safe 0'])
    .outputOptions(['-c copy', '-t', duration.toString()])
    .output(outputPath)
  
  return new Promise((resolve, reject) => {
    command.on('error', (err) => {
      console.log('Error prepare =>', err);
      reject(err);
    });
    command.on('end', () => {
      console.log('prepare => Done');
      resolve(outputPath);
    });
    command.run()
  })
}

const merge = (videoPath: string, audioPath: string, outputPath: string): Promise<string> => {
  const command = ffmpeg();
  command
    .input(videoPath)
    .input(audioPath)
    .outputOptions(['-c:v copy', '-c:a copy', '-shortest'])
    .output(outputPath)
  
  return new Promise((resolve, reject) => {
    command.on('error', (err) => {
      console.log('Error merge =>', err);
      reject(err);
    });
    command.on('end', () => {
      console.log('merge => Done');
      resolve(outputPath);
    });
    command.run();
  })
}

export {
  getFileData,
  transcodeAudio,
  transcodeVideo,
  prepare,
  merge
}




