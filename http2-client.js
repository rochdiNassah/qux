'use strict';

const EventEmitter = require('node:events');
const http2 = require('node:http2');
const zlib = require('node:zlib');
const urlParser = require('node:url').parse;
const helpers = require('./helpers');
const { format } = require('node:util');

const { checkConnectivity, awaitInternet } = helpers;

const log = console.log.bind(console);

class Http2Client extends EventEmitter {
  static USER_AGENT = format(
    'Mozilla/5.0 (Linux; Android 14; Nokia X20 Build/UKQ1.231003.002; wv) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.106 ' +
    'Mobile Safari/537.36 DofusTouch Client 1.1.1',
  );
    
  constructor(retryOnError = true, reqTimeout = 32e3) {
    super();

    this.reqTimeout = reqTimeout;
    this.retryOnError = retryOnError;
    this.clients = new Map();
  }

  get(urlString, headers) {
    return _request.call(this, 'GET', urlString, headers);
  }

  post(urlString, headers, body) {
    return _request.call(this, 'POST', urlString, headers, body);
  }

  put(urlString, headers, body) {
    return _request.call(this, 'PUT', urlString, headers, body);
  }

  patch(urlString, headers, body) {
    return _request.call(this, 'PATCH', urlString, headers, body);
  }

  delete(urlString, headers, body) {
    return _request.call(this, 'DELETE', urlString, headers, body);
  }

  destroy() {
    for (const client of this.clients.values()) client.destroy();
  }
}

function _request(method, urlString, headers, body) {
  return new Promise(async r => {
    const args = [method, urlString, headers, body];

    const { protocol, path, host } = urlParser(urlString);
    const { clients } = this;

    const options = {
      ':method': method,
      ':scheme': 'https',
      ':path': path,
      ...headers
    };

    if (!options.hasOwnProperty('User-Agent') || !options['User-Agent'].length) {
      options['User-Agent'] = Http2Client.USER_AGENT;
    }

    const url = protocol+'//'+host;
    const res = { statusCode: -1, headers: {}, data: {} };

    let client = clients.get(url);

    if (!client) {
      client = http2.connect(url).once('error', () => clients.delete(url)).once('close', () => clients.delete(url));
      clients.set(url, client);
    }
    
    let req = client.request(options);

    function onError() {
      clients.delete(url);

      if (!this.retryOnError) return (log('Request error'), r(res));

      checkConnectivity().then(isOnline => {
        log('Request error | %s', isOnline ? 'Retrying...' : 'Waiting for internet...');

        if (isOnline) return r(_request.apply(this, args));

        awaitInternet().then(() => r(_request.apply(this, args)));
      });
    };

    req.setTimeout(this.reqTimeout, onError.bind(this));
    req.once('error', onError.bind(this));

    req.once('response', headers => {
      res.headers = headers;
      res.statusCode = headers[':status'];

      if ('gzip' === headers['content-encoding']) {
        req = req.pipe(zlib.createGunzip());
      }

      const dataBuff = [];
      req.on('data', dataBuff.push.bind(dataBuff));

      req.once('end', () => {
        res.data = Buffer.concat(dataBuff).toString();
        try { res.data = JSON.parse(res.data) } catch (e) {}
        r(res);
      });
    });

    if (body) req.write(body);

    req.end();
  });
}

module.exports = Http2Client;