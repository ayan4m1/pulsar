# Pulsar

This is software to run scripted firing sequences on an Evolv DNA device.

**NOTE**: Because this device can fire a vaporizer, it can start an actual fire if used improperly. Please read the liability disclaimer in `LICENSE` before using this software.

## Installation

Install the current [Node.js LTS version](https://nodejs.org/en).

> npm i -g @ayan4m1/pulsar

## Usage

> pulsar --help

**TODO**: Proper usage examples!

## Puff Files

A .puff file is a CSV file like this:

```csv
# Lines starting with a hash are comments and are ignored
# The next line sets wattage to 10 watts
W,10
# The next line fires for 5 seconds
F,5
# The next line waits for 7 seconds
P,7
# Now a simple "wattage curve" for demonstration
W,30
F,3
P,1
W,50
F,3
P,2
W,40
F,3
P,5
```
