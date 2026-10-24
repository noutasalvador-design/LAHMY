# LAHMY — Site officiel

Site officiel responsive de LAHMY, artiste auteur-compositeur-interprète originaire de Porto-Novo, Bénin. Le projet utilise **Vercel** pour l'hébergement, **Neon PostgreSQL** pour la base de données et **Vercel Blob** pour les fichiers audio/pochettes téléversés. Les médias historiques du dépôt sont conservés.

## Fonctionnalités incluses
- Site public responsive en français/anglais, musique, biographie, vidéos, contact et réseaux.
- WhatsApp : https://wa.me/2290167822467 ; e-mail : lahmymusic@gmail.com.
- Formulaire de contact qui ouvre l'application e-mail du visiteur.
- Lecteur audio et catalogue public des sorties publiées.
- Administration privée sur `/admin.html` : connexion, ajout de singles/albums/mixtapes, téléversement audio/pochettes, publication/dépublication/suppression, ordre des pistes et statistiques de lecture/téléchargement.
- API serverless Vercel dans `/api`.
- Schéma PostgreSQL : `schema.sql`.

## 1. Préparer Neon
1. Crée un projet gratuit sur https://neon.tech/.
2. Ouvre **SQL Editor** et exécute tout le contenu de `schema.sql`.
3. Dans **Connect**, copie la chaîne de connexion PostgreSQL complète, avec SSL. Elle sera utilisée comme variable Vercel `DATABASE_URL`. Ne la publie pas dans GitHub.

## 2. Préparer le stockage audio et images
1. Dans le tableau de bord Vercel, crée un **Blob Store** pour le projet.
2. Ajoute ou vérifie la variable `BLOB_READ_WRITE_TOKEN` dans les variables d'environnement du projet Vercel.
3. Les téléversements d'audio sont limités à 100 Mo par fichier et les pochettes à 10 Mo.

## 3. Déployer sur Vercel
1. Ouvre https://vercel.com/ et connecte le compte GitHub qui possède `noutasalvador-design/LAHMY`.
2. Choisis **Add New → Project**, importe le dépôt **LAHMY**, branche `main).
3. Laisse Vercel détecter le projet. Le dépôt est un site statique avec fonctions Node dans `api/`; aucun build command spécifique n'est nécessaire.
4. Dans **Environment Variables**, ajoute les variables ci-dessous pour **Production**, **Preview** si souhaité et **Development** si nécessaire :
   - `DATABASE_URL` : chaîne de connexion Neon.
   - `ADMIN_EMAIL` : `lahmymusic@gmail.com`.
   - `ADMIN_PASSWORD` : choisis un mot de passe unique, long et non réutilisé.
   - `SESSION_SECRET` : chaîne aléatoire secrète d'au moins 32 caractères. Exemple de génération locale : `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
   - `BLOB_READ_WRITE_TOKEN` : jeton fourni par Vercel Blob.
5. Clique **Deploy**. Après chaque changement de GitHub, Vercel doit lancer un nouveau déploiement automatiquement si l'intégration est active.
6. Teste `https://TON-DOMAINE-VERCEL/api/health` : résultat attendu lorsque Neon est configuré : `{"ok":true,"service":"lahmy-official-site","database":"connected"}`.
7. Ouvre `https://TON-DOMAINE-VERCEL/admin.html`, connecte-toi avec l'adresse et le mot de passe définis dans Vercel, puis ajoute une piste de test.

## Sécurité
- Les secrets sont à définir dans les paramètres Vercel, jamais dans le dépôt.
- La session admin est signée côté serveur, stockée dans un cookie HttpOnly/Secure et expire après 8 heures.
- Les API de gestion et de téléversement exigent une session administrateur.
- Ne partage pas la chaîne Neon, le jeton Blob ou le mot de passe.
- Les statistiques d'écoute/téléchargement sont indicatives : elles sont envoyées par le navigateur et ne constituent pas une mesure anti-fraude.
- Les éléments éditables de biographie, galerie, actualités et vidéos ne sont pas encore reliés à l'admin ; la gestion musicale est la première partie connectée.
- Le formulaire de contact utilise `mailto:` ; il n'envoie pas de courrier depuis un serveur.

## Vérification et limites
Le code et les configurations ont été poussés dans GitHub. Le déploiement Vercel et la connexion Neon ne peuvent être déclarés opérationnels qu'après connexion au compte Vercel, ajout des secrets, exécution de `schema.sql` et vérification de l'URL `/api/health`. Les fichiers d'origine sans extension sont volontairement laissés intacts.
