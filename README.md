# GameHeroes – Frontend (video-game-frontend)

Interface web en **React 19 + Vite** pour gérer une collection de personnages de jeux vidéo.
Elle utilise l'API ASP.NET Core : [videoGameCharacterApi](https://github.com/eouni5870-prog/videoGameCharacterApi).

## Fonctionnalités

- Liste des personnages en **cartes avec photo**, rôle et niveau
- **Recherche** par nom, **filtres** par jeu et par rôle, **pagination**
- **Fiche détaillée** d'un personnage
- **Connexion / création de compte** (jeton JWT)
- **Ajouter, modifier, supprimer** personnages et jeux (utilisateur connecté)
- **Upload de photo** avec aperçu
- Design sombre « gaming », adapté au mobile

## Organisation

```
src/
├── main.jsx        → point d'entrée
├── App.jsx         → navigation et connexion
├── api.js          → toutes les requêtes vers l'API
├── useAuth.js      → utilisateur connecté (localStorage)
└── components/     → Header, CharactersPage, CharacterCard, CharacterDetail,
                      CharacterForm, ImagePicker, GamesPage, GameForm,
                      AuthForm, Modal, Pagination, ErrorMessage
```

## Lancer le projet

1. Lancer d'abord l'API (backend) sur https://localhost:7062
2. Première fois : `npm install`
3. `npm run dev`
4. Ouvrir http://localhost:5173

## Auteur

Eya Ouni – 3ème année Génie Logiciel
