const logger = require('./logger/logger')
const {client} = require('./aws/cloud-watch')

const health = (app) => app.get('/healthz', (req, res) => {
  client.increment('healthz_check');
  res.status(200).send("OK");
  logger.customlogger.info('Access of API healthz')
});

module.exports = health;