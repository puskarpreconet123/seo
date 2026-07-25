// Placeholder dbBatch implementation for memory mode / fallback
const updateBatchJobStatus = async (batchId, status) => {};
const getBatchJob = async (batchId) => null;
const getNextPendingUrl = async (batchId) => null;
const updateUrlStatus = async (batchId, url, status) => {};
const updateUrlResult = async (batchId, url, status, score, errMsg, results) => {};

module.exports = {
  updateBatchJobStatus,
  getBatchJob,
  getNextPendingUrl,
  updateUrlStatus,
  updateUrlResult
};
