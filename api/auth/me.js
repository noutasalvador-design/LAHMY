const { send, admin, method } = require('../_lib');
module.exports = async function handler(req,res) {
  if (!method(req,res,['GET'])) return;
  try {
    const ok = await admin(req);
    return send(res,200,{authenticated:ok,email:ok?process.env.ADMIN_EMAIL:null});
  } catch { return send(res,200,{authenticated:false}); }
};