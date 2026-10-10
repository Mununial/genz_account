const http = require('http');

http.get('http://127.0.0.1:5002/api/polls/1/export-csv', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
  });
});
