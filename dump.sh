#!/bin/sh                                                                         

echo "Active timespans..."
node index.js active-timespans > ./active-timespans.json
echo "Active weekly..."
node index.js active-weekly > ./active-weekly.json
echo "Lifespans..."
node index.js lifespans > ./lifespans.json
echo "Done"

