import Chalk from 'src/libs/chalk';
import Pexels from 'src/apis/pexels';
import { DownloadService } from 'src/utils/download';
import { getExtension } from 'src/utils/helpers';
import fs from 'fs-extra';
import path from 'path';

const fetchVideoWithPexels = async (search: string) => {
  let videos: any[] = [];
  try {
    const pexels = new Pexels();
    Chalk.info('Fetching videos from Pexels...');

    if (search) {
      videos = await pexels.searchVideos(search);
    } else {
      videos = await pexels.popularVideos();
    }

    if (!videos.length) {
      Chalk.warning(`No videos found for search {${search}}`);
    } else {
      Chalk.success(`Videos fetched from Pexels {${videos.length}}`);
    }

    return videos;
  } catch (error) {
    Chalk.error(`Error fetching videos from Pexels: ${error}`);
    return videos;
  }
};

const downloadVideo = async (limitFile: number = 5, search: string = '') => {
  const videos = await fetchVideoWithPexels(search);
  const listData: Array<any> = [];

  if (videos.length > 0) {
    Chalk.info('Downloading videos...');
    if (videos.length < limitFile) limitFile = videos.length;
    for (let i = 0; i < limitFile; i++) {
      const { id, url, image, duration } = videos[i];
      const downloadService = new DownloadService(id.toString());
      const [pathVideo, pathImage] = await Promise.all([
        downloadService.downloadFile(url, getExtension(url)),
        downloadService.downloadFile(image, getExtension(image)),
      ]);
      listData.push({ id, pathVideo, pathImage, duration });
    }
    Chalk.success(`Downloaded ${listData.length} videos`);
    return listData;
  }
}

const getAllPaths = () => {
  if (!fs.existsSync('public/temp')) {
    fs.ensureDirSync('public/temp');
  }
  const folders = fs.readdirSync('public/temp');
  return folders.map(folder => path.join('public/temp', folder, 'video.mp4'));
}

export { fetchVideoWithPexels, downloadVideo, getAllPaths };
