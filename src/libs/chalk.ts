import chalk from 'chalk';
const log = console.log;

export default class Chalk {
  static blue: any;
  static green: any;
  static yellow: any;
  static red: any;

  public static info(message: any): void {
    log(chalk.blue(message));
  }

  public static success(message: any): void {
    log(chalk.green(message));
  }

  public static warning(message: any): void {
    log(chalk.yellow(message));
  }

  public static error(message: any): void {
    log(chalk.red(message));
  }
}
