const logger = require('./logger/logger')
const apiCallCounter = require("./aws/cloud-watch")

const health = (app) => app.get('/healthz', apiCallCounter, (req, res) => {
  res.status(200).send("OK");
  logger.customlogger.info('Access of API healthz')
});

module.exports = health;