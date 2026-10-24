const { db, send, method } = require('./_lib');
module.exports = async function handler(req,res) {
 if(!method(req,res,['GET']))return;
 try { await db()`select 1 as ok`; return send(res,200,{ok:true,service:'lahmy-official-site',database:'connected'}); }
 catch(e) { console.error('LAHMY health:',e.message); return send(res,503,{ok:false,service:'lahmy-official-site',database:'disconnected'}); }
};