# LAHMY — Site officiel

Site officiel responsive de LAHMY, artiste auteur-compositeur-interprète originaire de Porto-Novo, Bénin. Interface française/anglaise, musique, biographie, vidéos, contact, liens sociaux et espace admin.

## Déjà ajouté au dépôt
- Site public FR/EN et interface responsive.
- Conservation des fichiers média d'origine présents dans le dépôt.
- Contact direct WhatsApp : https://wa.me/2290167822467
- Formulaire de contact qui prépare un e-mail vers lahmymusic@gmail.com (l'envoi final dépend de l'application e-mail du visiteur).
- Lecteur audio pour le fichier original déjà présent.
- Catalogue public connecté à Supabase quand le projet est configuré.
- Tableau admin avec connexion Supabase, ajout de sorties audio et pochettes, publication/dépublication, suppression et comptage simple des événements.
- Schéma SQL avec règles RLS et règles de stockage dans `supabase/schema.sql`.

## Mise en service de l'administration

L'interface admin et le code backend client sont dans le dépôt, mais **l'administration ne pourra pas se connecter tant que le projet Supabase n'aura pas été configuré**. Aucun identifiant Supabase ni mot de passe n'est inventé ou enregistré dans GitHub.

1. Créez un projet gratuit sur https://supabase.com/ et ouvrez son SQL Editor.
2. Copiez puis exécutez le contenu de `supabase/schema.sql`.
3. Dans Supabase → Storage, créez trois buckets **publics** nommés exactement `lahmy-audio`, `lahmy-covers` et `lahmy-media`. Les politiques de stockage du SQL restreignent les téléversements et suppressions au compte admin autorisé.
4. Dans Supabase → Authentication → Users, créez le compte LAHMY avec l'adresse `lahmymusic@gmail.com` et un mot de passe fort. N'envoyez jamais le mot de passe dans le dépôt.
5. Dans le SQL Editor, exécutez cette requête pour accorder le rôle admin au compte qui vient d'être créé :
   ```sql
   insert into public.admin_users(user_id,email)
   select id,email from auth.users where email='lahmymusic@gmail.com'
   on conflict (user_id) do nothing;
   ```
6. Dans Supabase → Project Settings → API, copiez **Project URL** et la clé **publishable/anon** (jamais la clé `service_role`). Remplacez les deux valeurs dans `config.js` :
   ```js
   window.LAHMY_CONFIG = {
     SUPABASE_URL: "https://votre-projet.supabase.co",
     SUPABASE_ANON_KEY: "votre-cle-publishable"
   };
   ```
7. Publiez le dépôt, puis ouvrez `/admin.html`. Connectez-vous avec le compte créé à l'étape 4.
8. Ajoutez une sortie depuis l'administration. Cochez « Publier immédiatement » pour la rendre visible dans le catalogue public.

### Sécurité et limites actuelles
- Ne placez jamais de mot de passe ou de clé `service_role` dans les fichiers du site.
- L'admin n'est autorisé que si l'utilisateur existe dans `public.admin_users`; les règles RLS doivent rester activées.
- Les événements de lecture/téléchargement sont des statistiques simples côté client, donc indicatives et non protégées contre les abus.
- La gestion de singles/albums/mixtapes, des pochettes et de la publication audio est reliée. La gestion graphique de biographie, actualités, vidéos et galerie photo reste à compléter dans l'admin.
- Le formulaire de contact utilise `mailto:`; pour une boîte de réception serveur et une protection anti-spam, il faudra connecter un service de formulaire.
- Les fichiers média historiques sans extension sont laissés intacts. Leur lecture dépend du type MIME fourni par l'hébergeur ; vérifiez le rendu en ligne avant tout renommage.

## Déploiement gratuit
Le dépôt contient un site statique, mais **GitHub Pages n'était pas activé lors de la vérification**. Pour publier gratuitement : GitHub → Settings → Pages → choisir la branche `main` et le dossier `/(root)`, puis Save. L'URL GitHub Pages apparaît lorsque le déploiement est prêt. Le dépôt peut aussi être connecté à Vercel ou Netlify.

## Contact et réseaux
- E-mail : lahmymusic@gmail.com
- WhatsApp : +229 016 782 2467
- Facebook : https://www.facebook.com/share/1JJYzkeezv/?mibextid=wwXIfr
- TikTok : https://www.tiktok.com/@lahmymusic
- YouTube : https://youtube.com/@lahmymusic
