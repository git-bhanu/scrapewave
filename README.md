# Krenovate OPT IN Submission script

### Description
This project enables sales people to solve two problems.

1. Find number of products on a website
1. Find emails for a list of domains

### Usage

1. Install the node package mentioned in the `engines` key of  `package.json` in the local system.
2. Run `npm install` to install all the dependent libraries.
3. Run `npm run start` to start the web application.
4. You can now access the webapp at: `http://localhost:3000/`
5. Go to `Data` page to upload a valid CSV. You can find a sample CSV [sample CSV here.](/sample.csv)
6. Click on Start to start running the automation, you can track the progress in the home page.
7. You can download the final csv from header Download CSV menu.

### Important Commands

```bash
docker pull selenium/standalone-chrome
docker run -d -p 4444:4444 -v /dev/shm:/dev/shm selenium/standalone-chrome
```


```bash
docker build -t data-validator .
docker run --name data-validtor-1 -p 3000:3000 data-validator
	
docker tag ad52caf9cfe6 krenovate/data-validator:1.0.2
docker push krenovate/data-validator:1.0.2
```
https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04

Check status of docker
sudo systemctl status docker
