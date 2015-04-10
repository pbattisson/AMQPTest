var jackrabbit = require('jackrabbit');
var logger = require('logfmt');
var throng = require('throng');
var cpus = require('os').cpus().length;

var RABBIT_URL = process.env.CLOUDAMQP_URL || 'amqp://localhost';

throng(start, { workers: cpus, lifetime: Infinity });

function start() {
  logger.log({ type: 'info', message: 'starting info service' });

  var broker = jackrabbit(RABBIT_URL, 1);
  broker.once('connected', create);
  process.once('uncaughtException', onError);

  function create() {
    broker.create('info.get', serve);
  }

  function serve() {
    logger.log({ type: 'info', message: 'serving info' });

    broker.handle('info.get', function getInfo(message, reply) {
      logger.log({ type: 'info', message: 'info served from this process.' });
      reply("Here is your info");
    });
  }

  function onError(err) {
    logger.log({ type: 'error', service: 'info', error: err, stack: err.stack || 'No stacktrace' }, process.stderr);
    logger.log({ type: 'info', message: 'killing info service' });
    process.exit();
  }
}
