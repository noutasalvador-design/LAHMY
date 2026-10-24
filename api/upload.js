const { handleUpload } = require('@vercel/blob/client');
const { admin } = require('./_lib');
module.exports = async function handler(req,res) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({error:'Méthode non autorisée.'}); }
  try {
    return await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!(await admin(req))) throw new Error('Connexion administrateur requise.');
        const payload = JSON.parse(clientPayload || '{}');
        const kind = payload.kind === 'cover' ? 'cover' : 'audio';
        const ext = String(pathname).split('.').pop().toLowerCase();
        const allowed = kind === 'cover'
          ? ['image/jpeg','image/png','image/webp']
          : ['audio/mpeg','audio/mp3','audio/wav','audio/ogg','audio/mp4','audio/aac'];
        return {
          allowedContentTypes: allowed,
          maximumSizeInBytes: kind === 'cover' ? 10*1024*1024 : 100*1024*1024,
          tokenPayload: JSON.stringify({kind,admin:true,ext})
        };
      },
      onUploadCompleted: async () => {}
    });
  } catch(e) {
    console.error('LAHMY upload:',e.message);
    return res.status(400).json({error:'Téléversement refusé. Vérifiez la connexion admin et le stockage Vercel Blob.'});
  }
};