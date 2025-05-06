const crypto = require('crypto');

function checkTelegramAuth(data, botToken) {
  const { hash, ...rest } = data;
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const checkString = Object.keys(rest).sort().map(k => ${k}=${rest[k]}).join('\n');
  const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
  return hmac === hash;
}

module.exports = checkTelegramAuth;
