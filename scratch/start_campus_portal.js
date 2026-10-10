const path = require('path');
process.chdir('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal');

process.on('uncaughtException', (err) => {
  console.error('[CRASH PREVENTED] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRASH PREVENTED] Unhandled Rejection:', reason);
});

require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server.js');

setInterval(() => {
  // Keep event loop alive forever
}, 60000);
