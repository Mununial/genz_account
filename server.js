/**
 * ==============================================================================
 * GEN-Z UNIVERSITY (GZU) - PRODUCTION ENTRY POINT FOR HOSTINGER NODE.JS
 * ==============================================================================
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const app = require('./backend/server.js');
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Hostinger Node.js] Server started on port ${PORT}`);
  });
}

module.exports = app;
