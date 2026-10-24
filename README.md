# LAHMY — Site officiel

Première base du site officiel de LAHMY : design urbain, responsive, navigation française/anglaise, sections musique/artiste/vidéos/contact et liens sociaux.

## Fichiers
- `index.html` : site public
- `styles.css` : styles responsive
- `app.js` : lecteur audio, contrôle du volume/progression, navigation mobile et langue FR/EN
- `admin.html` : page d'information préparant l'espace d'administration

## Médias d'origine
Les médias présents dans le dépôt sont conservés sans retouche ni remplacement. Le site référence les noms existants. Certains fichiers ne possèdent pas d'extension ; le rendu direct par navigateur dépend du type MIME retourné par l'hébergement. Il faudra vérifier le format réel des fichiers et leur affichage avant de normaliser les chemins, sans modifier les originaux.

## État
La base du site public est créée. Le lecteur utilise le fichier audio déjà présent dans le dépôt comme aperçu. L'administration sécurisée n'est pas encore fonctionnelle : il faut choisir et connecter une base de données, un fournisseur d'authentification et un stockage de fichiers. La page admin explique cette limite et n'affiche pas de connexion simulée.

## Déploiement
Pour une mise en ligne gratuite, ouvrir **Settings → Pages** dans le dépôt GitHub, choisir **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis enregistrer. GitHub Pages fournira l'URL une fois la publication terminée. On peut également connecter le dépôt à un hébergeur statique.

Contact public : lahmymusic@gmail.com  
Réseaux : Facebook, TikTok et YouTube (liens inclus sur le site).
