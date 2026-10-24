const { send, cookie, method } = require('../_lib');
module.exports = async function handler(req,res) {
  if (!method(req,res,['POST'])) return;
  res.setHeader('Set-Cookie',cookie('',0));
  return send(res,200,{ok:true});
};