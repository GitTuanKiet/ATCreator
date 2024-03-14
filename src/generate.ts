import {
  getFileData,
  transcodeAudio,
  transcodeVideo,
  prepare,
  merge
} from './fluent-ffmpeg';
import {
  fetchVideoPexels,
  fetchSoundFreeSound
} from 'src/ai.api';
import { cleaner, downloader } from 'src/helper';
import path from 'path';
import bun from 'bun';

const downloadService = async (limit: number, urlArr: string[]) => {
  const list: string[] = [];
  if (urlArr.length < limit) limit = urlArr.length;
  const randomIndex = Math.floor(Math.random() * (urlArr.length - limit));
  const downloadPromises = urlArr.slice(randomIndex, randomIndex + limit).map((image) => downloader(image));

  try {
    const result = await Promise.all(downloadPromises);

    result.forEach((path) => {
      if (path) list.push(path);
    });
  } catch (error) {
    console.error('downloadPromises =>', error);
  }
    
  return list;
}

const transcodeService = async (pathArr: string[], concatPath: string, ext: string): Promise<string> => {
  let transcodingPromises: Promise<string>[] = [];
  const dataPromises: Promise<any>[] = [];

  if (ext === 'mp4') {
    transcodingPromises = pathArr.map((path) => {
      const outputPath = path.replace('.mp4', '_transcoded.mp4');
      dataPromises.push(getFileData(path))
      return transcodeVideo(path, outputPath);
    });
  } else if (ext === 'mp3') {
    transcodingPromises = pathArr.map((path) => {
      const outputPath = path.replace('.mp3', '_transcoded.mp3');
      dataPromises.push(getFileData(path))
      return transcodeAudio(path, outputPath);
    });
  } else {
    console.error('transcodeService =>', 'Invalid extension');
  }

  try {
    const listData = await Promise.all(dataPromises)

    const fileList = listData
      .sort((a, b) => a.format.duration - b.format.duration)
      .map((item) => {
        const name = item.format.filename
        const ext = path.extname(name)
        return `file '${name.replace(ext, '_transcoded' + ext)}'`;
      })
      .join('\n');

    await Promise.all(transcodingPromises);

    await bun.write(concatPath, fileList);
  } catch (error) {
    console.error('transcodeAudioService =>', error);
  }

  return concatPath;
}

(async () => {
  const pathPublic = path.join(__dirname, '../', 'public');
  cleaner(pathPublic);

  console.log('fetching =>');
  const [
    resultPexels,
    resultFreeSound
  ] = await Promise.all([
    fetchVideoPexels(''),
    fetchSoundFreeSound()
  ])

  // const imageUrlArr = resultPexels?.map((item) => item.image) || []
  const videoUrlArr = resultPexels?.map((item) => item.link) || []
  const audioUrlArr = resultFreeSound?.map((item) => item.link) || []
  
  console.log('download =>');
  // const imagePathArr = await downloadService(10, imageUrlArr)
  const videoPathArr = await downloadService(10, videoUrlArr)
  const audioPathArr = await downloadService(10, audioUrlArr)

  const concatVideoPath = 'concatVideo.txt';
  const concatAudioPath = 'concatAudio.txt';
  const videoPath = './public/video.mp4';
  const audioPath = './public/audio.mp3';
  const outputPath = './public/output.mp4';

  console.log('Transcode =>');
  await transcodeService(videoPathArr, concatVideoPath, 'mp4'),
  await transcodeService(audioPathArr, concatAudioPath, 'mp3')

  console.log('Prepare =>');
  await prepare(concatVideoPath, 60, videoPath),
  await prepare(concatAudioPath, 60, audioPath)

  console.log('Merge =>');
  const result = await merge(videoPath, audioPath, outputPath);

  console.log('Result =>', result);
})();