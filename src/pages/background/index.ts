chrome.alarms.onAlarm.addListener((alarm) => {
  console.log({ alarm }, new Date());
});

chrome.alarms.create("watchdog", {
  delayInMinutes: 0,
  periodInMinutes: 1,
});

chrome.alarms.create("watchdog2", {
  delayInMinutes: 0.5,
  periodInMinutes: 1,
});
