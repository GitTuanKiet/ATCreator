import fs from 'fs-extra';
import bun from 'bun';
import path from 'path';
import Chalk from 'src/libs/chalk';
import { defaultDownloadPath } from './constant';
import { multiBar } from 'src/libs/cliProgress';
import { createFileName } from './helpers';

export class DownloadService {
  private dirName: string;

  constructor(uuid: string) {
    this.dirName = path.join(defaultDownloadPath, uuid);

    if (!fs.existsSync(this.dirName)) {
      fs.mkdirSync(this.dirName, { recursive: true });
    }
  }

  public async downloadFile(url: string, ext: string): Promise<string> {
    const fileName = createFileName(ext);
    const filePath = path.join(this.dirName, `${fileName}${ext}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        // verbose: true,
      });

      // const totalSize = Number(response.headers.get('content-length'));
      // const bar = multiBar.create(totalSize, 0, { fileName: `${fileName}${ext}` });
      await bun.write(filePath, response)

      return filePath;
    } catch (error) {
      throw Chalk.error(`Error downloading file: ${error}`);
    } finally {
      multiBar.stop();
    }
  }
}
