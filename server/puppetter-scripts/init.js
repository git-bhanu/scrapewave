import utils from '../utils.js';

export class DataExtractorPuppeteer {
    urlData;
    driver;
    completedEmails = [];
    pageConfig = { waitUntil: 'networkidle0', timeout: 3000 }

    constructor(driver, urlItem) {
        this.driver = driver;
        this.urlData = urlItem;
    }

    async startProcessing() {
        try {
            utils.info(this.urlData.url, `⌛ Visiting the URL`);
            await this.driver.goto(this.urlData.url, this.pageConfig);
            utils.info(this.urlData.url, `⌛ Successfully accessed the website`);
            await this.driver.close();
            await this.urlData.setStatus('completed');
        } catch (e) {
            console.log(e);
            throw new Error(`Unable to open the page ${e}`);
        }
    }
}
