'use strict';

const Http2Client = require('./http2-client');
const helpers = require('./helpers');
const log = console.log.bind(console);
const EventEmitter = require('node:events');
const WebScoket = require('ws');

const { parseHeaders, rand } = helpers;

const httpClient = new Http2Client(false);
const ee = new EventEmitter();

(async () => {
  const targets = {
    ilyas: {
      tokens: [
        'MTM2Mjc3ODkxMjAzNTE4MDY3NQ.GcIwbw.dt9GIc0g7agXzYGmOc7FwjgihbMe9rxe5db0sM',
        'MTM2MTkzMzEzNzE3NjgyNTkzMA.GYNPAm.andITgsWp4pztHW8SdqKcO4U1Z6sH8julm70Ws',
        'MTM2Mjc4ODI1NTI3NTI4Njc0Mg.Gw7fCK.py6XDTkw6dRDQPN2HtOgCi8BZm8HhqlCqrXbvQ',
        'MTM2MzI1NzMxMjU0NTk5Njg5MQ.GmHcI7.T2yRPlh0UAcBVdzMRh2xRXqm8_jX99lgDw__Zw',
        'MTM2MzQzMDY5MjUyODMyNDgxMA.G0lF0Z.XQp2Z1bMaEXEePjfhVji5yzG0mm3FvcQ6p8XDg'
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

  function attach(token, targetUser) {
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
      setTimeout(attach, 4e3, token);
    }

    client.write = data => {
      client.send(JSON.stringify(data));
    };

    client.once('op::10', () => {
      client.write({"op":2,"d":{"token":token,"capabilities":161789,"properties":{"os":"Linux","browser":"Chrome","device":"","system_locale":"fr","has_client_mods":false,"browser_user_agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36","browser_version":"134.0.0.0","os_version":"","referrer":"","referring_domain":"","referrer_current":"","referring_domain_current":"","release_channel":"stable","client_build_number":401882,"client_event_source":null,"client_launch_id":"b4233f9b-580a-490f-9221-03eda93b72e0","client_app_state":"unfocused","is_fast_connect":false,"latest_headless_tasks":[],"latest_headless_task_run_seconds_before":null,"gateway_connect_reasons":"AppSkeleton"},"presence":{"status":"unknown","since":0,"activities":[],"afk":false},"compress":false,"client_state":{"guild_versions":{}}}});
    });

    client.on('op::10', data => {
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
        client.write({"op":37,"d":{"subscriptions":{"1312666401189920829":{"members":[targetUser]}}}})
      } else if ('PRESENCE_UPDATE' === t) {
        if (targetUser === d.user.id) {
          ee.emit('adminStatus', d.status);
        }
      }
    });
  }

  const url = 'https://discord.com/api/v9/users/@me';
  const headers2 = {
    Host: 'discord.com',
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
    Referer: 'https://discord.com/channels/1312666401189920829/1369468564540489799',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'fr',
    Priority: 'u=1, i'
  };
  const body = JSON.stringify({"global_name":"ab"});

  // httpClient.patch(url, headers2, body).then(res => {
  //   log(res.data);
  //   res.data.errors ? log(res.data.errors.global_name) : log(res.data.errors);
  // });

  attach(tokens[0], users.front_man);

  var isAdminAway = null;
  ee.on('adminStatus', status => {
    isAdminAway = 'offline' === status;
    if (!isAdminAway) {
      tokens.forEach(token => {
        headers['Authorization'] = token;
        httpClient.post('https://discord.com/api/v9/channels/'+channels[0].id+'/typing', headers);
      });
    }
  });
  
  const headers = {
    'Content-Length': '0',
    'Sec-Ch-Ua-Platform': '"Linux"',
    Authorization: '',
    'X-Debug-Options': 'bugReporterEnabled',
    'Sec-Ch-Ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
    'Sec-Ch-Ua-Mobile': '?0',
    'X-Discord-Timezone': 'Africa/Casablanca',
    'X-Super-Properties': 'eyJvcyI6IkxpbnV4IiwiYnJvd3NlciI6IkNocm9tZSIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJmciIsImhhc19jbGllbnRfbW9kcyI6ZmFsc2UsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChYMTE7IExpbnV4IHg4Nl82NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzNC4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTM0LjAuMC4wIiwib3NfdmVyc2lvbiI6IiIsInJlZmVycmVyIjoiIiwicmVmZXJyaW5nX2RvbWFpbiI6IiIsInJlZmVycmVyX2N1cnJlbnQiOiIiLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiIiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjo0MDI0MDIsImNsaWVudF9ldmVudF9zb3VyY2UiOm51bGwsImNsaWVudF9sYXVuY2hfaWQiOiIzM2MwYWI4ZC05NjExLTQ2ZTgtYWM4YS01NTgxNzMwYjFkN2EiLCJjbGllbnRfaGVhcnRiZWF0X3Nlc3Npb25faWQiOiI1MjM3OTMwOS1mYzQzLTQyMzMtYmQyNS1iODgyMTQzY2Q2ZDUiLCJjbGllbnRfYXBwX3N0YXRlIjoiZm9jdXNlZCJ9',
    'X-Discord-Locale': 'fr',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    Accept: '*/*',
    Origin: 'https://discord.com',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    Referer: 'https://discord.com/channels/1312666401189920829/1369468564540489799',
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