const { handleUpload } = require('@vercel/blob/client');
const { admin } = require('./_lib');
module.exports = async function handler(req,res) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({error:'Méthode non autorisée.'}); }
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!(await admin(req))) throw new Error('Connexion administrateur requise.');
        const payload = JSON.parse(clientPayload || '{}');
        const kind = ['cover','media'].includes(payload.kind) ? payload.kind : 'audio';
        const ext = String(pathname).split('.').pop().toLowerCase();
        return {
          // Omit allowedContentTypes so Blob accepts any MIME type.
          // The admin UI still guides users to choose the right media field.
          maximumSizeInBytes: kind === 'cover' ? 10*1024*1024 : 100*1024*1024,
          tokenPayload: JSON.stringify({kind,admin:true,ext})
        };
      },
      onUploadCompleted: async () => {}
    });
    return res.status(200).json(jsonResponse);
  } catch(e) {
    console.error('LAHMY upload:',e.message);
    return res.status(400).json({error:'Téléversement refusé. Vérifiez la connexion admin et le stockage Vercel Blob.'});
  }
};