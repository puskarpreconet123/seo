let cronIntervalHandle = null;

async function runDailyAnalyticsSync() {
  console.info('[CronScheduler] Initiating daily SEO analytics sync job...');
  try {
    // If Prisma is optional or configured, sync data
  } catch (err) {
    console.error('[CronScheduler] Error running daily sync job:', err);
  }
}

function startCronScheduler() {
  if (cronIntervalHandle) {
    clearInterval(cronIntervalHandle);
  }
  console.info('[CronScheduler] Starting background SEO scheduler...');
}

function stopCronScheduler() {
  if (cronIntervalHandle) {
    clearInterval(cronIntervalHandle);
    cronIntervalHandle = null;
    console.info('[CronScheduler] Background scheduler stopped.');
  }
}

module.exports = {
  runDailyAnalyticsSync,
  startCronScheduler,
  stopCronScheduler
};

