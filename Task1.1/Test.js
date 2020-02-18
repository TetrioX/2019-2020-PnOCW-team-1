const ntpsync = require('ntpsync');
var delta = [];
var min = [];
var succPing = 0;



async function getTime() {
  let promise = new Promise(() => ntpsync.ntpLocalClockDeltaPromise().then((iNTPData) => {
    delta.append(iNTPData.minimalNTPLatencyDelta);
    min.append(iNTPData.minimalNTPLatency);
    succPing += iNTPData.totalSampleCount
  }).catch((err) => {
      console.log(err);
  }));

  // wait until the promise returns us a value
  let result = await promise;
}

for (let i=0; i < 10; i++) {
  getTime()
}


console.log(`(Local Time - NTP Time) Delta = ${delta} ms`);
console.log(`Minimal Ping Latency was ${min} ms`);
console.log(`Total ${succPing} successful NTP Pings`);
