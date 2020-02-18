const ntpsync = require('ntpsync');

ntpsync.ntpLocalClockDeltaPromise().then((iNTPData) => {
    console.log(`(Local Time - NTP Time) Delta = ${iNTPData.minimalNTPLatencyDelta} ms`);
    console.log(`Minimal Ping Latency was ${iNTPData.minimalNTPLatency} ms`);
    console.log(`Total ${iNTPData.totalSampleCount} successful NTP Pings`);
}).catch((err) => {
    console.log(err);
});
