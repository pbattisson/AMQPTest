var jackrabbit = require('jackrabbit');
var logger = require('logfmt');
var throng = require('throng');
var cpus = require('os').cpus().length;

var RABBIT_URL = process.env.CLOUDAMQP_URL || 'amqp://localhost';

throng(start, { workers: cpus, lifetime: Infinity });

function start() {
  logger.log({ type: 'info', message: 'starting time service on process ' + process.pid });

  var broker = jackrabbit(RABBIT_URL, 1);
  broker.once('connected', create);
  process.once('uncaughtException', onError);

  function create() {
    broker.create('time.get', serve);
  }

  function serve() {
    logger.log({ type: 'time', message: 'serving time' });

    broker.handle('time.get', function gettime(message, reply) {
      logger.log({ type: 'time', message: 'time served from process: ' + process.pid });
      var currentTime = 'The time is: ' + (new Date()).toTimeString();
      reply({
        time: currentTime,
        served_from_process: process.pid
      });
    });
  }

  function onError(err) {
    logger.log({ type: 'error', service: 'time', error: err, stack: err.stack || 'No stacktrace' }, process.stderr);
    logger.log({ type: 'info', message: 'killing time service' });
    process.exit();
  }
}