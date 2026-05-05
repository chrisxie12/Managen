// BullMQ/Redis disabled — trial expiration checks skipped in dev
const scheduleTrialCheck = () => {};
module.exports = { trialQueue: null, trialWorker: null, scheduleTrialCheck };
