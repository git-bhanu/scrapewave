# ScrapeWave

🕷️ **ScrapeWave** is a starter project for any scraping task where you want to monitor the progress and save data after scarping.

This project uses multiple technologies to achieve the requirement.

1. Server
    1. [ViteExpress](https://github.com/szymmis/vite-express) - @vitejs integration module for @expressjs.
    2. [SQlite](https://github.com/kriasoft/node-sqlite) - SQLite client wrapper around sqlite3 for Node.js applications with SQL-based migrations API written in Typescript.
    3. [Puppeteer](https://github.com/puppeteer/puppeteer) - Node.js API for Chrome
    4. [https://github.com/socketio/socket.io](Socket.io) - Realtime application framework (Node.JS server).
    5. Other packages worth mentioning are:-
    	- axios
		- fast-csv
2. UI
    1. [VueJs](https://vuejs.org/) - Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web
    2. [Pinia](https://pinia.vuejs.org/) - Intuitive, type safe, light and flexible Store for Vue using the composition api with DevTools support.
    3. [Vuetify](https://vuetifyjs.com/en/getting-started/installation/) - Vue Component Framework

3. [Docker](https://www.docker.com/) - Accelerated Container Application Development

## Installation & Usage

Pre-requisite

1. Node - ^21.7.2
2. Docker - LTS
3. [Chromium](https://www.chromium.org/getting-involved/download-chromium/) - Needed to run puppeteer on. When deploying its automatically installed in the image.

Steps to start development.

1. Clone the [🕷️ ScrapeWave repository](https://github.com/git-bhanu/scrapewave) into your local system.
2. Install dependencies using `npm install`
3. And start the server using `npm run start-dev`

## Development

The recommend way to extend scrapewave is as following.

#### Update the schema of database

Open `/server.js` and update the following to add more fields which you would want to save. 

```js
await database.exec(
    `CREATE TABLE IF NOT EXISTS ${databaseTableName} (
    'id' INTEGER PRIMARY KEY,
    'url' VARCHAR(20) NOT NULL UNIQUE,
    'status' TEXT(50) NOT NULL DEFAULT 'not_started',
    'error' VARCHAR(1000))`
);
```

Once this is done, you need to update it at few more places,

1. For the import function to work you need to add it the `addUrlToDb` function, for that visit `./server/databaseScript.js` and find `addUrlToDb` function, update this line code block to reflect new fields added.

```js
await database.run(
    'INSERT OR IGNORE INTO "domain" (url, status, error) VALUES (:url, :status, :error)',
    {
        ':url': rows[i].url,
        ':status': rows[i].status ? rows[i].status : 'not_started',
        ':error': rows[i].error ? rows[i].error : '',
    }
);
```

2. Visit `./server/model.js` and update the class to include all the new fields you just added in the database.


#### Adding logic for scraping

Visit `./server/puppetter-scripts/init.js` `async startProcessing()` is the method where the actual scraping happens.

Add logic in this class which should be reflective of what scraping you are trying to do.

When you add the logic, it recommended to add logging so that you can see what's exactly happening.

You can do that like this

1. To log console with an information use 
```js
utils.info(this.urlData.url, `⌛ Visiting the URL`);
```
2. To log console with an information use 
```js
utils.error(this.urlData.url, `Error occured`);
``` 

### Update the status and field values for an entry

In `./server/model.js` we have two methods which can be used to update status and error which can be used like this

```js
// Update status
await urlItem.setStatus('completed');

// Update Error field
await urlItem.setError(`Error: ${e}`);
```

Extend modal class to have setters for other fields.


## Deployment

Recommened way to deploy this in cloud is via docker.

Create and image from your current directory

```bash
docker build -t bhanu/scrapewave:latest .
```
Here, `bhanu` would be the docker hub username and `scrapewave` is the name of the image.

Once you have created the image, login into your docker hub from your local system and push the image which can be easily accessible from any other remote machine.

You can do that using.

```bash
dokcer push bhanu/scrapewave:latest
```

Now your scraper is ready to be deployed to any cloud machine.

#### Deploying in a cloud machine

Once you have `ssh`'ed into your machine you need to install two softwares, docker and Nginx.

> To install Docker follow the steps here:
> https://www.digitalocean.com/community/questions/how-to-install-and-run-docker-on-digitalocean-dorplet

> To install Nginx follow the steps here:
> https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04

Once you have successfully installed both,

You can use docker run -dit --name <instance-name> -p <port>:3000 krenovate/data-validator:latest to create a container.

```
docker run -dit -v instance-1:/usr/src/app/db --name instance-1 -p 8080:3000 --restart on-failure bhanu/scrapewave:latest
```

This command does quite a few things:

1. Creates a container using latest tag of bhanu/scrapewave

1. Mounts the SQlite database in your host filesystem, ensuring even if you recreate the the container with instance-1 volume your data would still be persistent.

1. For any scenario if the container exists, it will try to restart the container so that your scraping doesn't stop.