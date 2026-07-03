# SchoolCalendar

Visualiseur de calendriers iCal Ypareo avec filtres, construit avec React, FullCalendar et Bootstrap 5.

## Fonctionnalités

- **Vue multi-mois** de l'année en cours
- **Gestion des calendriers** : ajout et suppression via une interface dédiée, persistée dans le localStorage
- **Filtres** : sujet, groupe, enseignant, salle — repliables pour agrandir la vue calendrier
- **Tooltip** au survol d'un événement avec le détail complet (sujet, groupe, professeur, salle, horaires)
- **Export** des sujets filtrés dans le presse-papier

## Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [FullCalendar 6](https://fullcalendar.io/) — plugins `multimonth` et `icalendar`
- [Bootstrap 5](https://getbootstrap.com/) + Bootstrap Icons
- [Vite 8](https://vite.dev/)

## Lancer le projet

```bash
npm install
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

## Ajouter un calendrier

Cliquer sur **Gérer les calendriers** et renseigner :

- **Nom** : libellé affiché dans le sélecteur
- **URL ou token iCal** : accepte une URL complète (`https://…`) ou uniquement le token JWT présent en fin d'URL Ypareo

## Proxy de développement

Les flux iCal sont servis par `formations.mayenne.cci.fr` sans en-têtes CORS. Vite redirige les requêtes `/api/ical/<token>` vers le serveur distant côté Node.js pour contourner cette restriction en développement.

En production, un proxy équivalent doit être configuré côté serveur (nginx, etc.).

## TODO

- [ ] Remplacer le proxy de développement par un serveur Node.js minimal pour servir les flux iCal côté serveur
