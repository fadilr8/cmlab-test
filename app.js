const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const port = 3000;

const createFolderIfNotExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
};

const removeHttpFromUrl = (url) => {
  return url.replace('http://', '').replace('https://', '');
};

app.get('/api/crawl', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    res.status(400).send('No URL provided');
    return;
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url);

    const htmlContent = await page.content();
    const fileName = removeHttpFromUrl(`crawled_${uuidv4()}_${url}.html`);
    const filePath = path.join(__dirname, 'crawled', fileName.toString());
    createFolderIfNotExists(path.join(__dirname, 'crawled'));
    fs.writeFileSync(filePath, htmlContent);

    await browser.close();

    res.send('Crawled successfully: ' + url);
  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong');
  }
});

app.listen(port, () => {
  console.log(`Server is running in port:${port}`);
});
