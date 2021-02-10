#! /usr/bin/env node
/*
  Simple parser for Google Location history from JSON to CSV
  Google Location JSON Information:
  JSON contains one array under the key "locations"
  Each location object contains 'timestampMs', 'latitudeE7', 'longitudeE7', 'accuracy'
  Convert latitude and longitude to decimal by dividing by 10000000
*/

const fs = require('fs');

if (process.argv.length < 3) {
  console.log('Converts a Google location history file to a CSV');
  console.log('Usage:location-json2csv "Location History.json" history.csv');
} else if (!fs.existsSync(process.argv[2])) {
  console.log(`Can't locate file:${process.argv[2]}`);
} else {
  parseFile();
}

function parseFile () {
  const file = fs.readFileSync(process.argv[2]);
  const locationJSON = JSON.parse(file);
  const csvArray = [];
  let prevRecordDate = '';
  let dateID = 0;

  for (var i = 0; i < locationJSON.locations.length; i++) {
    const loc = locationJSON.locations[i];
    const currentDate = new Date(parseInt(loc.timestampMs)).toISOString().split('T')[0];
    if (currentDate !== prevRecordDate) {
      dateID++;
      prevRecordDate = currentDate;
    }

    csvArray.push({
      time: loc.timestampMs,
      lat: loc.latitudeE7 / 10000000,
      lng: loc.longitudeE7 / 10000000,
      groupID: dateID
    });
  }
  const outputName = process.argv[3] || 'history.csv';

  let csvText = 'lng, lat, time, groupID\n';
  csvArray.map(item => { csvText += `${item.lng}, ${item.lat}, ${item.time}, ${item.groupID}\n`; });
  fs.writeFileSync(outputName, csvText);
  console.log(`[Success] Output: ${outputName}`);
}
