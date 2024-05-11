import chalk from "chalk";

export default {
  error(url, message) {
    console.log(`${chalk.gray(new Date().toLocaleString())} ${chalk.black.bgRedBright(' ERROR ')} ${chalk.bold.blueBright(`[${url}]`)} ${message}`);
  },
  info(url, message) {
    console.log(`${chalk.gray(new Date().toLocaleString())} ${chalk.black.bgGreen(' INFO ')} ${chalk.bold.blueBright(`[${url}]`)} ${message}`);
  },

}