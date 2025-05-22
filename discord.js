'use strict';

const Http2Client = require('./http2-client');
const helpers = require('./helpers');
const log = console.log.bind(console);
const EventEmitter = require('node:events');

const { rand, formatDuration, benchmark, getBackoff, arrayRand, parseTemplate } = helpers;

const httpClient = new Http2Client(false);
const ee = new EventEmitter();

(async () => {
  const targets = {
    ilyas: {
      tokens: [
        'MTM3NDgzMDk5NjY0MTI4ODIzOQ.GwSP3X.jDsMwuXGrMX-QFZShnIyIujcB5UIVMI8JCCyHk',
        'MTM2Mjc3ODkxMjAzNTE4MDY3NQ.G-z_1J.0g5mFsmXPFSEK8aKiCju4MQ-IrfWdxBSWO1btA',
        'MTM2MTkzMzEzNzE3NjgyNTkzMA.GrqlhA.4Ogmf_xWfzcK-7xLZhg9JtnJieb4lAeOb4jfvQ',
        'MTM2Mjc4ODI1NTI3NTI4Njc0Mg.GXUxM4.lxPWObTkxHmzkglAr_JlXSLLkYLX4NZZCyncVA',
        'MTM2MzI1NzMxMjU0NTk5Njg5MQ.G2_l5M.VvZmkEwsDbVSvVKH9jJS1-Oxh_5vK-qqiWVbnk',
        'MTM2MzQzMDY5MjUyODMyNDgxMA.GbR26X.2-hzNqY1PyZ-mxXt27QQtNn9YzY-DHsvi43rsM'
      ],
      channels: [
        { name: 'chat', id: '1369468564540489799' },
      ]
    },
    dofus: {
      tokens: [
      ],
      channels: [
        { name: 'brutas', id: '275905973724381185' },
        { name: 'bavardage', id: '263261754514079746' },
        { name: 'oshimo', id: '263268164018634752' },
        { name: 'herd', id: '263268204485410817' },
        { name: 'terra', id: '263268185552191489' },
      ]
    }
  }

  // const target = targets[process.argv[2]];
  // if (!target) return log('Target not found');

  const { tokens, channels } = targets.ilyas;

  tokens.shuffle();
  
  const headers = {
    Host: 'discord.com',
    'Content-Length': '0',
    'Sec-Ch-Ua-Platform': '"Linux"',
    Authorization: '',
    'X-Debug-Options': 'bugReporterEnabled',
    'Sec-Ch-Ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
    'Sec-Ch-Ua-Mobile': '?0',
    'X-Discord-Timezone': 'Africa/Casablanca',
    'X-Super-Properties': 'eyJvcyI6IkxpbnV4IiwiYnJvd3NlciI6IkNocm9tZSIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJmciIsImhhc19jbGllbnRfbW9kcyI6ZmFsc2UsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChYMTE7IExpbnV4IHg4Nl82NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzNC4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTM0LjAuMC4wIiwib3NfdmVyc2lvbiI6IiIsInJlZmVycmVyIjoiIiwicmVmZXJyaW5nX2RvbWFpbiI6IiIsInJlZmVycmVyX2N1cnJlbnQiOiIiLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiIiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjozOTE5MjEsImNsaWVudF9ldmVudF9zb3VyY2UiOm51bGx9',
    'X-Discord-Locale': 'en-US',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    Accept: '*/*',
    Origin: 'https://discord.com',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    Referer: 'https://discord.com/channels/263261754514079746/263261754514079746',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'fr',
    Priority: 'u=1, i'
  };
  
  let isPaused = false;
  while (true) {
    for (let i = 0; !isPaused && i < channels.length; i++) {
      for (let j = 0; j < tokens.length; j++) {
        headers['Authorization'] = tokens[j];
        httpClient.post('https://discord.com/api/v9/channels/'+channels[i].id+'/typing', headers).then(res => {
          const { statusCode } = res;
          
          if ([401, 403].includes(statusCode)) {
            process.exit(0);
          } else if (204 !== statusCode && !isPaused) {
            log(res.data);
            isPaused = true;
            log('Paused');
            setTimeout(() => (log('Resuming'), process.exit(1)), 1e4);
          }
        });
      }
    }
    await new Promise(r => setTimeout(r, 5500, 7500));
  }
})();