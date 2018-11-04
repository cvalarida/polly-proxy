#!/bin/bash

# NOTE: This doesn't actually work, but I'm keeping it for posterity for now

# Grab the port from the cli arguments; default to 12345
# TODO: _Actually_ grab this from the cli option
# https://stackoverflow.com/questions/192249/how-do-i-parse-command-line-arguments-in-bash
__port=12345

# Grab the current http_proxy
__old_http_proxy=$http_proxy
echo "Old http_proxy: ${__old_http_proxy}"

# Set the new one
export http_proxy=http://localhost:${__port}/
echo "Setting http_proxy to ${http_proxy}"

# Cleanup after we're done
function __cleanup_before_exit () {
    info "Resetting http_proxy back to ${__old_http_proxy}"
    # Reset the http_proxy
    export http_proxy=${__old_http_proxy}
}
trap __cleanup_before_exit EXIT

# Start the server with the options passed to this script
__script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
__parrot_server=${__script_dir}/parrot.js

node __parrot_server "$@"
