const Crawler = require('./index');

var crawler = new Crawler('test crawler');

function testGetFile() {
  var url = 'http://chart.finance.yahoo.com/table.csv?s=^DJI&a=3&b=1&c=2007&d=3&e=1&f=2017&g=d&ignore=.csv';
  var filename = 'dji.csv';
  return crawler.getFile(url, filename);
}

function testGetString() {
  var url = 'http://chart.finance.yahoo.com/table.csv?s=^DJI&a=3&b=1&c=2007&d=3&e=1&f=2017&g=d&ignore=.csv';
  return crawler
    .getString(url)
    .tap(console.log);
}

function testGetJSON() {
  var url = 'https://query2.finance.yahoo.com/v7/finance/spark?range=1d&interval=5m&indicators=close&includeTimestamps=false&includePrePost=false&corsDomain=finance.yahoo.com&symbols=%5EGSPC';
  return crawler
    .getJSON(url)
    .tap((data)=>{
      console.log(typeof data, data);
    });
}

function testGetCSV() {
  var url = 'http://chart.finance.yahoo.com/table.csv?s=^DJI&a=3&b=1&c=2007&d=3&e=1&f=2017&g=d&ignore=.csv';
  return crawler
    .getCSV(url)
    .tap(console.log);
}

function testGetLinks() {
  var url = 'https://finance.yahoo.com/';
  return crawler
    .toString(url)
    .then(crawler.getLinks)
    .tap(console.log);
}

testGetFile();
testGetString();
testGetJSON();
testGetCSV();
