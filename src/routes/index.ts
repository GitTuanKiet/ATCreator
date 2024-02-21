import express from 'express';
import { generateVideoController } from 'src/controllers/videoController';

const router = express.Router();

router.route('/video')
  .post(generateVideoController)

export default router;
