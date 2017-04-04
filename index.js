const fs = require('fs');
const util = require('s-util');
const request = require('request');
const cheerio = require('cheerio');

const Promise = util.Promise;
const _ = util._;

const requestAsync = Promise.promisify(request);
const csv = Promise.promisifyAll(require('csv'));


/**
 * A class for crawling the web
 */
class Crawler {

  /**
   * @param  {String} [name='crawler']    [name for this crawler]
   * @param  {[type]} [reqOptions=null]   [options for this crawler's requests]
   */
  constructor(name = 'crawler', reqOptions = null) {
    this.name = name;

    if (reqOptions === null) {
      reqOptions = this.getChromeOptions();
    }

    this.reqOptions = reqOptions;
  }

  /**
   * get request options for Chrome
   * @return {[type]} [chrome request options]
   */
  getChromeOptions() {
    return {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
      }
    };
  }

  /**
   * make a request using async
   * @param  {[type]} reqOptions [description]
   * @return {[type]}            [description]
   */
  requestAsync(reqOptions) {
    return requestAsync(reqOptions);
  }

  get(reqOptions, options = {}) {
    switch (options.type) {
      case 'stream':
        return this.getStream(reqOptions);
      case 'file':
        return this.getFile(reqOptions, options.filename);
      case 'csv':
        return this.getCSV(reqOptions);
      default:
        return this.getString(reqOptions);
    }
  }

  getStream(reqOptions) {
    return this
      ._processOptions(reqOptions)
      .bind(this)
      .then((reqOptions) => {
        return request
          .get(reqOptions)
          .on('response', this._checkStatusCode.bind(this));
      });
  }

  getFile(reqOptions, filename) {
    return this
      .getStream(reqOptions)
      .then((rstream) => {
        rstream = rstream.pipe(fs.createWriteStream(filename));
        return Promise
          .fromStream(rstream)
          .return (filename);
      });
  }

  getString(reqOptions) {
    return this
      ._processOptions(reqOptions)
      .bind(this)
      .then(this.requestAsync)
      .then(this._checkStatusCode)
      .get('body');
  }

  getJSON(reqOptions) {
    return this
      ._processOptions(reqOptions)
      .bind(this)
      .then((reqOptions) => {
        reqOptions.json = true;
        return reqOptions;
      })
      .then(this.requestAsync)
      .then(this._checkStatusCode)
      .get('body');
  }

  getCSV(reqOptions) {
    return this
      .getString(reqOptions)
      .then(this._parseCSV);
  }

  getLinks(htmlString) {
    return Promise
      .resolve(htmlString)
      .then((htmlString) => {
        var $ = cheerio.load(htmlString);
        var res = $('a').map((i, elem) => {
          return $(elem).attr('href');
        }).get();
        return res;
      });
  }

  _processOptions(reqOptions) {
    return Promise.try(() => {
      if (_.isString(reqOptions)) {
        reqOptions = {
          url: reqOptions
        };
      }
      return _.merge({}, reqOptions, this.options);
    });
  }

  _parseCSV(csvString, options = null) {
    // return a 2D array of values
    if (options === null) {
      options = {
        auto_parse: true
      };
    }
    return csv.parseAsync(csvString, options);
  }

  _checkStatusCode(res) {
    if (res.statusCode !== 200) {
      let err = new Error('NOT 200');
      err.res = res;
      err.statusCode = res.statusCode;
      throw err;
    }
    return res;
  }

}

module.exports = Crawler;
