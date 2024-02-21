import fs from 'fs-extra';
const { readFile, writeFile } = fs;

const timeFormatted = (amount: number, padLength: number = 2): string => amount.toString().padStart(padLength, '0');

const generateTime = (frequence: number) => (frame: number) => {
  const frameStart = frequence * frame;
  const millisec = frameStart % 1000;
  const sec = Math.floor(frameStart / 1000) % 60;
  const minutes = Math.floor(frameStart / 60000) % 60;
  const hours = Math.floor(frameStart / (60 * 60000));
  return `${timeFormatted(hours)}:${timeFormatted(minutes)}:${timeFormatted(sec)},${timeFormatted(millisec, 3)}`;
};

export const convertSrt = async (fileInput: string, duration: number, fileOutput: string) => {
  const durationInMs = duration * 1000;
  const file = await readFile(fileInput);
  const lines = file.toString().split('\n').filter(Boolean);
  const frequence = Math.floor(durationInMs / lines.length);
  const generateTimeForFrequence = generateTime(frequence);

  const srtLines = lines.map((line, index) => {
    return `${index + 1}
${generateTimeForFrequence(index)} --> ${generateTimeForFrequence(index + 1)}
${line}
`;
  });

  await writeFile(fileOutput, srtLines.join('\n'));
};