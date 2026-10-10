const nodemailer = require('c:/Users/munun/OneDrive/Desktop/genz_account/backend/node_modules/nodemailer');

async function testSend() {
  console.log('--- Testing Email 1: genzsupportbbsr@gmail.com ---');
  const transporter1 = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'genzsupportbbsr@gmail.com',
      pass: 'gnbtufoaqgahusyq'
    }
  });

  const res1 = await transporter1.sendMail({
    from: '"GenZ University Digital Campus" <genzsupportbbsr@gmail.com>',
    to: 'mununial637@gmail.com',
    subject: '🧪 [TEST] Sender Display Name Verification 1',
    text: 'Testing sender name from genzsupportbbsr@gmail.com. It should appear as GenZ University Digital Campus.'
  });
  console.log('Result 1:', res1.messageId);

  console.log('--- Testing Email 2: genzuniversitysupport@gmail.com ---');
  const transporter2 = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'genzuniversitysupport@gmail.com',
      pass: 'nlcrbbwvejjxrtpo'
    }
  });

  const res2 = await transporter2.sendMail({
    from: '"GenZ University Digital Campus" <genzuniversitysupport@gmail.com>',
    to: 'mununial637@gmail.com',
    subject: '🧪 [TEST] Sender Display Name Verification 2',
    text: 'Testing sender name from genzuniversitysupport@gmail.com. It should appear as GenZ University Digital Campus.'
  });
  console.log('Result 2:', res2.messageId);
}

testSend().catch(console.error);
