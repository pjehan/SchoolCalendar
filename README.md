# SchoolCalendar

Visualiseur de calendriers iCal Ypareo avec filtres, construit avec React, FullCalendar et Bootstrap 5.

## Fonctionnalités

- **Vue multi-mois** de l'année en cours (2 colonnes)
- **Gestion des calendriers** : ajout et suppression via une boîte de dialogue dédiée, persistée dans le localStorage
- **Sources multiples** : URL iCal complète, token Ypareo (passé par le proxy de développement) ou fichier `.ics` local placé dans `public/`
- **Filtres** : sujet, groupe, enseignant, salle — repliables pour agrandir la vue calendrier
- **Tooltip** au survol d'un événement avec le détail complet (sujet, groupe, professeur, salle, horaires)
- **Export** des sujets des événements filtrés dans le presse-papier

## Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) — avec le [React Compiler](https://react.dev/learn/react-compiler) activé
- [FullCalendar 6](https://fullcalendar.io/) — plugins `multimonth`, `icalendar` et `bootstrap5`
- [ical.js](https://github.com/kewisch/ical.js) — parsing des flux iCal (extraction sujet / groupes / enseignant / salle depuis les champs Ypareo)
- [Bootstrap 5](https://getbootstrap.com/) + Bootstrap Icons
- [Vite 8](https://vite.dev/)

## Lancer le projet

```bash
npm install
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

Autres scripts :

```bash
npm run build     # vérification TypeScript + build de production
npm run preview   # prévisualisation du build
npm run lint      # ESLint
```

## Ajouter un calendrier

Cliquer sur **Gérer les calendriers** et renseigner :

- **Nom** : libellé affiché dans le sélecteur
- **URL ou token iCal** : accepte au choix
  - une URL complète (`https://…`)
  - le token JWT présent en fin d'URL Ypareo (résolu via le proxy `/api/ical/<token>`)
  - le chemin d'un fichier `.ics` placé dans `public/` (ex. `20260629151327.ics`)

## Structure du projet

```
src/
├── App.tsx                  # Point d'entrée, import des styles Bootstrap
├── components/
│   └── Calendar.tsx         # Composant principal : calendriers, filtres, parsing iCal, vue FullCalendar
└── main.tsx
public/                      # Exports .ics locaux utilisables comme source
vite.config.ts               # React Compiler + proxy iCal de développement
```

## Proxy de développement

Les flux iCal sont servis par `formations.mayenne.cci.fr` sans en-têtes CORS. Vite redirige les requêtes `/api/ical/<token>` vers `https://formations.mayenne.cci.fr/net-ypareo/index.php/planning/ical-ressource/<token>` côté Node.js pour contourner cette restriction en développement.

En production, un proxy équivalent doit être configuré côté serveur (nginx, etc.).

## TODO

- [ ] Remplacer le proxy de développement par un serveur Node.js minimal pour servir les flux iCal côté serveur
