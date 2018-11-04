#!/usr/bin/env node

/**
 * Handles the CLI arguments and starts the server with the correct params.
 */

const commandLineArgs = require('command-line-args');

const server = require('./lib/server');

const optionDefinitions = [
  { name: 'port', type: Number, defaultValue: 12345 },
  { name: 'mode', type: String, defaultValue: 'playback' },
  { name: 'rules-file', type: String, defaultValue: 'parrot-rules.json'},
];

// Get the cli arguments
const options = commandLineArgs(optionDefinitions);

// Start the server with the appropriate parameters
server.start(options);
