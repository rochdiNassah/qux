'use strict';

// console.clear();

const util = require('node:util');
const https = require('node:https');
const { format } = util;
const http2 = require('node:http2');
const readline = require('readline');

const { stdin, stdout } = process;

exports.createReadline = function (cb) {
  return readline.createInterface({ input: stdin, output: stdout })
    .once('error', () => console.log('readline error'))
    .once('close', () => console.log('readline close'))
    .on('line', cb);
};

const actionsLockRegistry = new Map();
exports.lockAction = function (type, cb) {
  if (actionsLockRegistry.get(type)) {
    return false;
  }
  actionsLockRegistry.set(type, true);
  cb(actionsLockRegistry.set.bind(actionsLockRegistry, type, false));
  return true;
}

const backoffRegistry = new Map();
let isBackoffTriggered = false;
exports.getBackoff = function (opts) {
  let { type, min, max } = opts;

  min = min ?? 1e3;
  max = max ?? 192e4;

  if (!isBackoffTriggered) {
    isBackoffTriggered = true;
    setInterval(() => {
      backoffRegistry.forEach(backoff => {
        const { value, counter, lastTrigger } = backoff;
        console.log('curr:', counter);
        if (counter) {
          backoff.counter = Math.max(0, counter-Math.round((new Date()-lastTrigger)/value));
        }
      });
    }, 6e4);
  }

  if (!backoffRegistry.has(type)) {
    const obj = { counter: 0, value: -1, lastTrigger: null };
    backoffRegistry.set(type, obj);
  }

  const backoff = backoffRegistry.get(type);

  const value = backoff.value = Math.min(max, 2**(1+backoff.counter)+min);
  backoff.lastTrigger = new Date();

  if (value < max) {
    backoff.counter++;
  }
  
  return exports.rand(min/4, min)+value;
};

exports.benchmark = function (a, b, repetition = 10**6) {
  const { startTimer, endTimer } = exports;
  const result = {};

  startTimer('a');
  for (let i = 0; repetition > i; ++i) a(i);
  result.a = endTimer('a');

  startTimer('b');
  for (let i = 0; repetition > i; ++i) b(i);
  result.b = endTimer('b');

  return result;
};

exports.block = () => new Promise(r => setTimeout(r, 10**9));

exports.getIntersections = function (arrA, arrB) {
  const intersections = [];
  for (let i = 0; arrA.length > i; ++i) {
    if (-1 < arrB.indexOf(arrA[i])) {
      intersections.push(arrA[i]);
    }
  }
  return intersections;
};

exports.parseHeaders = function (base64) {
  const raw = Buffer.from(base64, 'base64').toString('utf8')
    .replace(/(POST|GET)\s\/.*\n/ig, '')
    .replace(/Content\-Length: \d{1,}\r\n/ig, '');
  const lines = raw.split(/\n/);
  const result = {};
  lines.forEach(line => {
    const [key, value] = line.split(/:\s/);
    result[key] = value;
  });
  return result;
};

exports.getType = function (value) {
  if ('object' !== typeof value) {
    return typeof value;
  }
  return null === value ? 'null' : Array.isArray(value) ? 'array' : 'object';
};

exports.isInRange = function (value = 0, range = []) {
  const [min, max] = range;
  return value >= min && value <= max;
};

exports.fetchIpAddress = async function () {
  const serviceUrl = 'https://checkip.amazonaws.com';
  const http2Client = new (require('./http2-client'))();
  const res = await http2Client.get(serviceUrl);
  if (200 === res.headers[':status']) {
    return res['data'].trim();
  }
  throw new Error('helpers.fetchIpAddress: Failed to grab ip address.');
};

exports.isNumber = function (value) {
  return 'number' === typeof value;
};

exports.isString = function (value) {
  return 'string' === typeof value;
};

exports.isUndefined = function (value) {
  return void 0 === value;
};

exports.createCodeVerifier = function () {
  const length = Math.floor(85 * Math.random() + 43);
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

  let result = '';
  for (let i = 0; length > i; ++i) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return exports.base64ToUrlSafe(btoa(result));
};

exports.base64ToUrlSafe = function (input) {
  return input.replace(/\+/g,"-").replace(/\//g,"_").replace(/[=]+$/,"");
};

const parseTemplatePatterns = {
  repeat: /([a-zA-Z1-9-_!?])\{\s{0,}(\d{1,}){1,}\s{0,},\s{0,}(\d{1,})\s{0,}\}/i,
  rand: /\((.+?(?=\)))\)/i,
  emojis: /\:([a-zA-Z1-9-_]+)\:/
};
const parseTemplateEmojis = {
  'a': "~1f91a~",
  'b': '~1f44a~',
  'c': '~1f923~'
};
exports.parseTemplate = function (text) {
  let match = new RegExp(parseTemplatePatterns.repeat, 'g')[Symbol.matchAll](text);
  if (match) {
    match = Array.from(match);
    match.forEach(m => {
      m.shift();
      text = text.replace(parseTemplatePatterns.repeat, m[0].repeat(exports.rand(parseInt(m[1]), parseInt(m[2]))));
    });
  }
  if (match = new RegExp(parseTemplatePatterns.rand, 'g')[Symbol.matchAll](text)) {
    match = Array.from(match);
    match.forEach(m => {
      m.shift();
      text = text.replace(parseTemplatePatterns.rand, exports.arrayRand(m[0].split('|')));
    });
  }
  if (match = new RegExp(parseTemplatePatterns.emojis, 'g')[Symbol.matchAll](text)) {
    match = Array.from(match);
    match.forEach(m => {
      m.shift();
      text = text.replace(parseTemplatePatterns.emojis, parseTemplateEmojis[m[0]].repeat(exports.rand(1, 4)));
    });
  }
  return exports.randomizer([[ '50%', exports.ucfirst ], [ '50%', t => t ]])(text);
};

exports.decodeHTMLEntities = function (input) {
  return input.replace(/&amp;/g, '&');
};

const timerRegistry = {};

exports.endTimer = function (label, format = true) {
  if ('string' !== typeof label || !label.length) {
    throw new Error('helpers.endTimer: Expects label to be of type string and of length greater than 1.');
  }
  const currDate = new Date();
  const prevDate = timerRegistry[label];

  delete timerRegistry[label];

  const result = currDate-prevDate;
  return format && result ? exports.formatDuration(result) : result;
};

exports.startTimer = function (label) {
  if ('string' !== typeof label || !label.length) {
    throw new Error('helpers.startTimer: Expects label to be of type string and of length greater than 1.');
  }
  if (timerRegistry[label]) {
    return false;
  }
  timerRegistry[label] = new Date();
};

exports.padString = function (string, padding, length = null, padRight = true) {
  if (!Number.isInteger(length)) {
    if (padRight) {
      if (!string.endsWith(padding)) {
        string += padding;
      }
    } else {
      if (!string.startsWith(padding)) {
        string = padding + string;
      }
    }
  } else if (length !== string.length && length > 0) {
    if (padRight) {
      string += padding.repeat(length - string.length);
    } else {
      string = padding.repeat(length - string.length) + string;
    }
  }
  return string;
};

exports.exit = function exit(...args) {
  console.log(...args);
  process.exit(0);
};

exports.hoursDiff = function (sourceDate, targetDate) {
  if (!(sourceDate instanceof Date) || !(targetDate instanceof Date)) {
    throw new Error('helpers.hoursDiff: Expects sourceDate and targetDate to be of type Date.');
  }
  return Math.round((sourceDate-targetDate)/1000/60/60);
};

exports.arrcmp = function arrcmp(...arrays) {
  arrays = arrays.map(arr => JSON.stringify(arr));
  const source = arrays[0];
  for (let i = 0, arr; i < arrays.length; i++) {
    arr = arrays[i];
    if (source !== arr) {
      return false;
    }
  }
  return true;
};

const agent = new https.Agent({ keepAlive: true, maxSockets: Infinity });
exports.request = function (opts = {}) {
  return new Promise(resolve => {
    const { hostname, port, path, method, headers, body } = opts;

    const req = https.request({ hostname, port, path, method, headers, agent }, res => {
      const buff = [];
      if ('gzip' === res.headers['content-encoding']) {
        const zlib = require('zlib');
        const gunzip = zlib.createGunzip();
        res.pipe(gunzip);
        res = gunzip;
      }
      res.on('data', buff.push.bind(buff));
      res.once('end', () => {
        let data = Buffer.concat(buff).toString();
        try {
          data = JSON.parse(data);
        } catch (e) {}
        res.data = data;
        resolve(res);
      });
    });

    req.once('error', async () => {
      if (awaitInternet && !await exports.checkConnectivity()) {
        console['log']('helpers.request: Waiting for internet');
        await exports.awaitInternet();
        resolve(exports.request(opts));
      } else {
        resolve({ statusCode: -1 });
      }
    });

    if (body) {
      req.write('object' === typeof body ? JSON.stringify(body) : body);
    }
    req.end();
  });
};

exports.checkConnectivity = function () {
  return new Promise(r => {
    const client = http2.connect('http://ankama.com');
    client.once('error', () => {
      client.destroy();
      r(false);
    });
    client.once('connect', () => {
      client.destroy();
      r(true);
    });
  });
};

exports.awaitInternet = function (interval = 4e3) {
  return new Promise(r => {
    const check = () => {
      exports.checkConnectivity().then(isOnline => {
        if (isOnline) {
          clearInterval(retryIntervalId);
          r(true);
        }
      });
    };
    const retryIntervalId = setInterval(check, interval);
    check();
  });
};

exports.formatDuration = function (ms) {
  const types = [
    [31104e6, ' year(s)'],
    [2592e6, ' month(s)'],
    [864e5, ' day(s)'],
    [36e5, ' hour(s)'],
    [6e4, ' minute(s)'],
    [1e3, ' second(s)'],
    [1, 'ms']
  ];

  const r = [];
  for (let i = 0, t, v; i < types.length; i++) {
    t = types[i];
    v = Math.floor(ms/t[0]);
    if (v) {
      ms -= t[0]*v;
      r.push(v+t[1]);
      if (1 < r.length) {
        break;
      }
    }  
  }

  return r.join(', ');
};

exports.probabilityCallback = function (percentage, callback, ...args) {
  percentage = parseInt(percentage);
  if (!Number.isInteger(percentage) || 100 < percentage || 0 > percentage) {
    throw new Error(
      format(
        'helpers.probabilityCallback() : Arguement #1 (percentage) must be in the range from 0% to 100%, %d% is given',
        percentage
      )
    );
  }
  const array = new Array(100-percentage);
  for (let i = 0; percentage > i; ++i) {
    array.push(true);
  }
  exports.shuffle(array);
  return exports.arrayRand(array) && callback(...args);
};

exports.ucfirst = function (...args) {
  if (1 !== args.length) {
    throw new Error(
      format(
        'helpers.ucfirst: Expects exactly 1 argument, %d is given.',
        args.length
      )
    );
  }
  const input = args.shift();
  if ('string' === typeof input && input.length) {
    return input[0].toUpperCase()+input.slice(1);
  }
  return input;
};

exports.toKebabCase = function (string) {
  return string.toLowerCase().replace(/[^\w\s\-]/ig, '').replace(/[^\w\-]/ig, '-');
};

exports.fetchMapping = function (type, ...ids) {
  const headers = {
    'Host': 'proxyconnection.touch.dofus.com',
    'Sec-Ch-Ua': '"Android WebView";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
    'Sec-Ch-Ua-Platform': '"Android"',
    'Sec-Ch-Ua-Mobile': '?1',
    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 9; SM-J415F Build/PPR1.180610.011)',
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'X-Requested-With': 'com.ankama.dofustouch',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9,ar-MA;q=0.8,ar;q=0.7',
    'Priority': 'u=1, i'
  };

  return new Promise(async r => {
    const res = await new (require('./http2-client'))()
      .post(
        'https://proxyconnection.touch.dofus.com/data/'+(type === 'text' ? type : 'map')+'?lang=en',
        headers,
        JSON.stringify({ class: type, ids })
      );
    if (200 === res.headers[':status'] && res.data) {
      let mapping = res.data;
      if (1 === Object.values(mapping).length) {
        mapping = Object.values(mapping)[0];
      }
      return r(mapping);
    }
    throw new Error(format('helpers.fetchMapping : Failed with http status code %d', res.headers[':status']));
  });
};

exports.wait = function (min, max) {
  if (void 0 === min || Infinity === min) {
    min = 2147483647;
  } else if (Array.isArray(min)) {
    [min, max] = min;
  }
  const milliseconds = void 0 !== max ? exports.rand(min, max) : min;
  return new Promise(resolve => setTimeout(() => resolve(milliseconds), milliseconds));
};

exports.isFloat = function (input) {
  return 0 !== input%1;
};

exports.rand = function (min, max) {
  return Math.round(min+(max-min)*Math.random());
};

exports.randFloat = function (min, max) {
  return Math.round((min+(max-min)*Math.random())*100)/100;
};

exports.arrayRand = function (candidates) {
  return candidates[Math.floor(candidates.length*Math.random())];
};

exports.strcmp = function (a, b) {
  if ('string' !== typeof a || 'string' !== typeof b) {
    return false;
  }
  return a.toLowerCase() === b.toLowerCase();
};

exports.getDate = function () {
  const t = new Date();
  const f = n => ('0'+n).slice(-2);
  t.setMonth(1+t.getMonth());
  return format('%s-%s-%s', t.getFullYear(), f(t.getMonth()), f(t.getDate()));
};

exports.getTime = function (seconds = false, milliseconds = false) {
  const t = new Date();
  const f = n => ('0'+n).slice(-2);
  const fms = n => ('000'+n).slice(-4);

  let result = format('%s:%s', f(t.getHours()), f(t.getMinutes()));

  seconds && (result += format(':%s', f(t.getSeconds())));
  milliseconds && (result += format('.%s', fms(t.getMilliseconds())));
  return result;
};

exports.randomizer = function (candidate, ...extraCandidates) {
  let totalPercentage = 0, chance = 0, value;

  const roulette = [];
  const candidates = Array.isArray(candidate) ? candidate : [candidate, ...extraCandidates];

  candidates.forEach(candidate => {
    [chance, value] = candidate;
    chance = parseInt(chance);
    if (!Number.isInteger(chance) || 0 > chance || 100 < chance) {
      throw new Error(format('helpers.randomizer: Expects a percentage in the range from 1% to 99%, %s is given.', chance));
    }
    totalPercentage += chance;
    for (let i = 0; chance > i; ++i) {
      roulette.push(value);
    }
  });
  if (100 !== totalPercentage) {
    throw new Error(format('helpers.randomizer: Expects the total percentage to be 100, %d is given.', totalPercentage));
  }
  exports.shuffle(roulette);
  const rand = Math.floor(roulette.length * Math.random());
  return roulette[rand];
};

exports.shuffle = function (arr) {
  for (let i = 0, ri, te, te2; i < arr.length; i++) {
    ri = Math.floor(arr.length * Math.random());
    te = arr[i];
    te2 = arr[ri];
    arr[i] = te2;
    arr[ri] = te;
  }
  return arr;
};

exports.randomString = function (length, numbers = true) {
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  numbers && (characters += '0123456789');

  for (let i = 0; i<length; i++) {
    result += characters.charAt(Math.floor((Math.random()*characters.length)));
  }
  
  return result;
};

Array.prototype.shuffle = function () {
  for (let i = 0, s = this.length, rand = exports.rand, r; i < s; i++) {
    r = rand(0, s-1);
    [this[i], this[r]] = [this[r], this[i]];
  }
  return this;
};

Map.prototype.timers = new Map();

Map.prototype.increment = function (key, by = 1) {
  let val = this.get(key);
  if (void 0 !== val) {
    val += by;
    this.set(key, val);
  }
  return val;
};

Map.prototype.decrement = function (key, by = 1) {
  let val = this.get(key);
  if (void 0 !== val) {
    val -= by;
    this.set(key, val);
  }
  return val;
};

Map.prototype.pull = function (key) {
  const value = this.get(key);
  this.delete(key);
  return value;
};

Map.prototype.remember = function (key, value, milliseconds) {
  const { timers } = this;
  clearTimeout(timers.get(key));
  timers.set(key, setTimeout(this.delete.bind(this), milliseconds, key));
  this.set(key, value);
};