var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    http = require('http'),
    app = express(),
    Cloud = require('mocha-cloud'),
    auth = fs.readFileSync(path.join(__dirname, '.auth'), 'ascii').trim().split(':'),
    cloud = new Cloud('climongoose', auth[0], auth[1]);

// express app config
app.set('port', 4000);
app.use(express.logger('dev'));
app.use(express.static(path.join(__dirname, '..')));

// create server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));

  // cloud testing..
  cloud.browser('internet explorer', '7', 'Windows 2003');
  cloud.browser('iphone', '5.0', 'Mac 10.6');
  cloud.browser('ipad', '6', 'Mac 10.8');
  cloud.url('http://localhost:'+ app.get('port') +'/test/cloud.html');

  cloud.on('init', function(browser){
    console.log('init : %s %s', browser.browserName, browser.version);
  });

  cloud.on('start', function(browser){
    console.log('start : %s %s', browser.browserName, browser.version);
  });

  cloud.on('end', function(browser, res){
    console.log('end : %s %s : %d failures', browser.browserName, browser.version, res.failures);
  });

  cloud.start();

});


