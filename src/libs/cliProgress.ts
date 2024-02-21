import cliProgress from 'cli-progress';

const singleBar = (filename: string) => {
  return new cliProgress.SingleBar({
    format: `{bar} | ${filename} |  {percentage}% | {value}/{total} | {duration}s`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    clearOnComplete: false,
    hideCursor: true,
  }, cliProgress.Presets.legacy);
}

const multiBar = new cliProgress.MultiBar({
    format: `{fileName} | {bar} | {percentage}% | {value}/{total}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    clearOnComplete: false,
    hideCursor: true,
  }, cliProgress.Presets.legacy);

export { singleBar, multiBar };