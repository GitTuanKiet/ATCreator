import { appConfig } from './config/app';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';

import Router from 'src/routes';

// import { generateVideo } from 'src/services/video';
import { initFfmpeg } from './libs/ffmpeg';


export class App {
  private app: express.Application = express();
  private port: Number = appConfig.port;

  public constructor() {
    this.bootstrap();
  }

  public async bootstrap() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(express.static(path.join(appConfig.path, 'views')));

    this.app.use(Router);

    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

(async () => {
  new App();
  initFfmpeg();
})();
