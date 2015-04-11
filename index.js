var logger = require('logfmt');
var jackrabbit = require('jackrabbit');
var express = require('express');
var throng = require('throng');
var cpus = require('os').cpus().length;

var RABBIT_URL = process.env.CLOUDAMQP_URL || 'amqp://localhost';
var SERVICE_TIME = process.env.SERVICE_TIME || 500;

throng(start, { workers: cpus, lifetime: Infinity });

function start() {
  logger.log({ type: 'info', message: 'starting server' });

  app = express();

  broker = jackrabbit(RABBIT_URL, 1);

  broker.once('connected', listen);
  broker.once('disconnected', exit.bind(this, 'disconnected'));
  process.on('SIGTERM', exit);

  app.get('/info', function(req, res){
    broker.publish('info.get', {}, function onInfo(err, retInfo) {
      res.send(retInfo);
    });
  });

  app.get('/time', function(req, res){
    broker.publish('time.get', {}, function onTime(err, retTime) {
      res.send(retTime);
    });
  });


  app.listen(8080);

  function listen() {
    broker.create('info.get');
    broker.create('time.get');
  }

  function exit(reason) {
    logger.log({ type: 'info', message: 'closing server', reason: reason });
    if (server) server.close(process.exit.bind(process));
    else process.exit();
  }
}
