const reportCardQueue = require('../jobs/reportCardQueue');

module.exports = {
  initializeQueue: reportCardQueue.initializeReportCardQueue,
  addReportCardJob: reportCardQueue.addReportCardJob,
  getJobStatus: reportCardQueue.getJobStatus,
  getQueue: reportCardQueue.getReportCardQueue,
};
