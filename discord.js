'use strict';

const Http2Client = require('./http2-client');
const helpers = require('./helpers');
const log = console.log.bind(console);
const EventEmitter = require('node:events');
const WebScoket = require('ws');

const { rand, formatDuration, benchmark, getBackoff, arrayRand, parseTemplate, wait } = helpers;

const httpClient = new Http2Client(false);
const ee = new EventEmitter();

(async () => {
  const targets = {
    ilyas: {
      tokens: [
        'MTM3NTQxMzY2NzY3OTcwMzA1MA.GKDAhV.bogcDO9SzBVs5g6sIa5MF9WV8Dejjf8KgwfbfQ',
        'MTM2Mjc3ODkxMjAzNTE4MDY3NQ.GInvH0.i59tb9bL8dCs9eL0ImXGNwTR5DhG5eAO-iKKfE',
        'MTM2MTkzMzEzNzE3NjgyNTkzMA.G7G7de.JBDDbplkwXRVW7lmfBLKw2v68L36vnucH5lI1w',
        'MTM2Mjc4ODI1NTI3NTI4Njc0Mg.G8BQ4Q.UyGxNoEcE4AItXcCR_D3skxIhDz7uMW8f4NZPs',
        'MTM2MzI1NzMxMjU0NTk5Njg5MQ.G4W9sK.4GFiCBAIAfdNXBF9nL9B6DhG5gaBjJVrcsQi_I',
        'MTM2MzQzMDY5MjUyODMyNDgxMA.Gxj-IE.LoRK2f5RYRtj85SEZTLQz_D6VvUvphJimPPmd8',
      ],
      users: {
        blanco: '1361019671142465827',
        front_man: '1287270641073913951'
      },
      channels: [
        { name: 'chat', id: '1369468564540489799' },
      ]
    }
  }

  // const target = targets[process.argv[2]];
  // if (!target) return log('Target not found');

  const { tokens, channels, users } = targets.ilyas;

  // tokens.shuffle();

  function attach(token) {
    const client = new WebScoket('wss://gateway.discord.gg/?encoding=json&v=9');
    client.once('error', () => log('connection error'));
    client.once('close', () => closed());
    client.once('open', () => log('connection open'));
    client.on('message', msg => {
      msg = JSON.parse(msg.toString());
      const { op, d } = msg;
      client.emit('op::'+op, msg);
    });

    function closed() {
      log('connection close');
      clearInterval(client.hbInterval);
      // attach(token);
    }

    client.write = data => {
      client.send(JSON.stringify(data));
    };

    client.once('op::10', () => {
      client.write({"op":2,"d":{"token":token,"capabilities":161789,"properties":{"os":"Linux","browser":"Chrome","device":"","system_locale":"fr","has_client_mods":false,"browser_user_agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36","browser_version":"134.0.0.0","os_version":"","referrer":"","referring_domain":"","referrer_current":"","referring_domain_current":"","release_channel":"stable","client_build_number":401882,"client_event_source":null,"client_launch_id":"b4233f9b-580a-490f-9221-03eda93b72e0","client_app_state":"unfocused","is_fast_connect":false,"latest_headless_tasks":[],"latest_headless_task_run_seconds_before":null,"gateway_connect_reasons":"AppSkeleton"},"presence":{"status":"unknown","since":0,"activities":[],"afk":false},"compress":false,"client_state":{"guild_versions":{}}}});
    });

    client.on('op::10', data => {
      log('recv hb interval');
      log(data);
      clearInterval(client.hbInterval);
      client.hbInterval = setInterval(() => client.write({"op":1,"d":75}), data.d.heartbeat_interval);
    });

    client.on('op::0', async data => {
      const { t, d } = data;

      if ('READY' === t) {
        log('ready');
        client.write({"op":4,"d":{"guild_id":null,"channel_id":null,"self_mute":true,"self_deaf":false,"self_video":false,"flags":2}});
        client.write({"op":3,"d":{"status":"invisible","since":0,"activities":[],"afk":false}});
        // client.write({"op":37,"d":{"subscriptions":{"1312666401189920829":{"members":[users.blanco]}}}})
        client.write({"op":37,"d":{"subscriptions":{"1312666401189920829":{"members":[users.front_man]}}}})
      } else if ('PRESENCE_UPDATE' === t) {
        if (users.blanco === d.user.id) {
          ee.emit('adminStatus', d.status);
        }
      }
    });
  }

  attach(tokens[0]);

  const url = 'https://discord.com/api/v9/users/@me';
  const headers2 = {
    Host: 'discord.com',
    // Cookie: '__dcfduid=1637d5f037bd11f0bf9307b47ac93eb5; __sdcfduid=1637d5f137bd11f0bf9307b47ac93eb5c9553f3cc9a5f8d32867dc40d8ed719540bc3a9931efbab8cca466fa7fb830f7; __cfruid=612a74ee09f6da25969c9cea9dca035c692bcef0-1747994570; _cfuvid=EwiEbxIvNAVt4Dsm0dxu4ytI.0cuQXiKVvfpOeJBzAc-1747994570964-0.0.1.1-604800000; __stripe_mid=d49b02e6-33b0-4c2c-9ac2-11b5a54cbfd32fd968; __stripe_sid=e1d469b7-a022-46eb-85a2-cd2adcef81202df6db; cf_clearance=_xwe9QXYQkFSWSCyzGONXrt58mZW65GeMPluiQzaUeM-1747995373-1.2.1.1-oWT0CzGWFT3kC1ixZBQ5QBl8KYFACa1yGmGC3j3UvWP2FYFpZf1SiIc7iYgjXMLvs6yM6Wi.ASVoxOsKvonUHxr0pyalk1C7tBmaRZqrPwPw4PEkgfQStUX1a3MHX7MEG.99KVSnjHEx0nppDdD5Bp_lB3qsd047TeDf6HzoeNDNZxpQMlEr9M1JjPH6Ui1J4AZ42uj6KykLWywoVLSy0cNYRE.9MbpBGe1C8Sjslt0Octtx3pahfz8cLjT4s.9CXLhjhcD8Nvf_QK.bCmrIxkvLdPlcugYyBxq88a.V.exsFw.3YW271v13Sfom6sdu_vVDFwoPTl0XNNMQ9zINGwTzCHLOFMOdr.qA1.a2XZ4',
    'Sec-Ch-Ua-Platform': '"Linux"',
    Authorization: 'MTM3NTQxMzY2NzY3OTcwMzA1MA.GKDAhV.bogcDO9SzBVs5g6sIa5MF9WV8Dejjf8KgwfbfQ',
    'X-Debug-Options': 'bugReporterEnabled',
    'Sec-Ch-Ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
    'Sec-Ch-Ua-Mobile': '?0',
    'X-Discord-Timezone': 'Africa/Casablanca',
    'X-Super-Properties': 'eyJvcyI6IkxpbnV4IiwiYnJvd3NlciI6IkNocm9tZSIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJmciIsImhhc19jbGllbnRfbW9kcyI6ZmFsc2UsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChYMTE7IExpbnV4IHg4Nl82NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzNC4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTM0LjAuMC4wIiwib3NfdmVyc2lvbiI6IiIsInJlZmVycmVyIjoiIiwicmVmZXJyaW5nX2RvbWFpbiI6IiIsInJlZmVycmVyX2N1cnJlbnQiOiIiLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiIiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjo0MDE4ODIsImNsaWVudF9ldmVudF9zb3VyY2UiOm51bGwsImNsaWVudF9sYXVuY2hfaWQiOiI5YzcwMTA1Yi02ZGZlLTQyMWMtYTk1NC0xOTVjMmMxYmE5YWEiLCJjbGllbnRfaGVhcnRiZWF0X3Nlc3Npb25faWQiOiIxYWEzZmI2Mi1lNTQ1LTRjM2MtOWZkYS0zMmNjZjQ5MWQ2MTYiLCJjbGllbnRfYXBwX3N0YXRlIjoiZm9jdXNlZCJ9',
    'X-Discord-Locale': 'fr',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    'Content-Type': 'application/json',
    Accept: '*/*',
    Origin: 'https://discord.com',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    Referer: 'https://discord.com/channels/1312666401189920829/1312672076334895114',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'fr',
    Priority: 'u=1, i'
  };
  const body = JSON.stringify({"global_name":"ab"});

  // httpClient.patch(url, headers2, body).then(res => {
  //   log(res.data);
  //   res.data.errors ? log(res.data.errors.global_name) : log(res.data.errors);
  // });

  var isAdminAway = null;
  ee.on('adminStatus', status => isAdminAway = 'offline' === status);
  
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
    for (let i = 0; !isPaused && null !== isAdminAway && i < channels.length; i++) {
      sub: for (let j = 0; j < tokens.length; j++) {
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
        if (isAdminAway) break sub; 
      }
    }
    await new Promise(r => setTimeout(r, 5500, 7500));
  }
})();