/**
 * @file sandbox.js
 * run user code in isolation
 * NOTE maintains code safe zone (NO IMPORTS)
 */

// runInNewContext
const vm = require('vm');

/**
 * Function to execute user code in blank context
 * @param String
 * NOTE attempts to run user code in complete isolation to prevent tampering
 */

function execute(code) {
  // times out after 0.5 seconds to prevent long running scripts (memory leaks)
  return vm.runInNewContext(code, undefined, {timeout: 500});
}

// all functions exported
module.exports = {
  execute: execute
}
