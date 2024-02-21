
import { generate } from 'src/services/generate';


const generateVideoController = async (req: any, res: any) => {
  try {
    await generate(req.body.keywords);
    return res.send(200).json({ message: 'Video generated' });
  } catch (error) {
    return res.send(500).error(error);
  }
};


export { generateVideoController };
