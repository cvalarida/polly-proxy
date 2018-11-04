const https = require('https');
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

function getPathToRecord(request) {
  // Get the path from the request
  const parsedUrl = url.parse(request.url);
  return `${path.join(
    'records',
    request.method,
    parsedUrl.host,
    // Save to www.example.com.json instead of www.example.com/.json
    parsedUrl.path === '/' ? '' : parsedUrl.path
  )}.json`;
}

const server = {
  start(options) {
    // TODO: If a rules file is specified, read it
    // For now, we're trying to test using this to intercept http traffic

    // Start listening
    this.listen(options);
  },

  listen(options) {
    const isRecording = options.mode === 'record';
    const isPlayback = options.mode === 'playback';

    const s = http.createServer((request, response) => {
      // When a request comes in, pass it to the request handler.
      // What the request handler does will depend on the mode:
      //  If it's in playback mode, it'll search for a saved response
      //   and play it back if found. If not found, it will make the
      //   request.
      //  If it's in record mode, it'll make the response and record
      //   it before playing it back.
      // The result of the request handler will be written to the response.

      const pathToRecording = getPathToRecord(request);
      console.log(`${request.method} ${request.url}`);

      if (isPlayback && fs.lstatSync(pathToRecording).isFile()) {
        // Play back the recorded response
        fs.readFile(pathToRecording, (err, rawData) => {
          if (err) {
            console.error(`Failed to read file at ${pathToRecording}`);
            console.error(err);
            return;
          }
          console.log('  Read record', pathToRecording);
          const data = JSON.parse(rawData);
          response.writeHead(data.statusCode, data.headers);
          response.write(data.body);
        });
      } else {
        // Either we're recording or the record doesn't exist
        this.fetch(request).then(({ resp: extResp, body }) => {
          if (isRecording) {
            const { statusCode, headers } = extResp;
            const data = {
              // time
              statusCode,
              headers,
              body,
            };

            this.record(pathToRecording, data);
          }

          response.writeHead(extResp.statusCode, extResp.headers);
          response.write(body);
        });
      }
    });

    s.listen(options.port);
    s.on('listening', () =>
      console.log(`Listening for HTTP requests on port ${options.port}`)
    );
  },

  fetch(options) {
    console.log(`  Querying ${options.url}`);
    const destination = url.parse(options.url);
    // TODO: Use this method
    // const method = options.method;

    return new Promise((resolve, reject) => {
      const recordResponse = resp => {
        let body = '';
        // A chunk of data has been recieved.
        resp.on('data', chunk => {
          body += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          resolve({ resp, body });
        });

        // The connection was cut short
        resp.on('aborted', () => {
          reject(resp, body);
        });
      };

      const protocol = destination.protocol === 'https' ? https : http;
      // protocol.request({
      //   // TODO: Use the destination properties
      // })
      protocol.get(destination, recordResponse).on('error', err => {
        console.error('Error: ', err.message);
      });
    });
  },

  record(pathToRecording, data) {
    // Make sure all the directories are in place...
    mkdirp(path.dirname(pathToRecording), writePathErr => {
      if (writePathErr) {
        console.error('Could not write path to', pathToRecording);
        console.error(writePathErr);
      }

      // Before writing the file
      fs.writeFile(
        pathToRecording,
        JSON.stringify(data, null, 2),
        fileWriteErr => {
          if (fileWriteErr) {
            console.error(fileWriteErr);
          } else {
            console.log('  recorded to', path.resolve(pathToRecording));
          }
        }
      );
    });
  },
};

module.exports = server;
