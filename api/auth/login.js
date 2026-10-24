const bcrypt = require('bcryptjs');
const { send, cookie, createSession, method } = require('../_lib');
module.exports = async function handler(req, res) {
  if (!method(req,res,['POST'])) return;
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) return send(res,503,{error:'Configurez ADMIN_EMAIL et ADMIN_PASSWORD_HASH dans Vercel.'});
    const okEmail = email === process.env.ADMIN_EMAIL.trim().toLowerCase();
    const okPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!okEmail || !okPassword) return send(res,401,{error:'E-mail ou mot de passe incorrect.'});
    const token = await createSession(email);
    res.setHeader('Set-Cookie',cookie(token,28800));
    return send(res,200,{ok:true,email});
  } catch (e) {
    console.error('LAHMY login:',e.message);
    return send(res,500,{error:'Connexion impossible. Vérifiez la configuration serveur.'});
  }
};