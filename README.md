# CV Studio

CV Studio est une version simplifiée de Reactive Resume centrée sur l’essentiel :

- créer et modifier un CV ;
- choisir les templates existants ;
- exporter le CV en PDF depuis le navigateur ;
- utiliser l’application sans serveur, sans base de données et sans connexion.

Le moteur PDF et les templates d’origine sont conservés.

## Déploiement GitHub Pages

Le dépôt contient un workflow prêt à l’emploi :

```text
.github/workflows/pages.yml
```

À chaque push sur `main`, GitHub Actions construit l’application en mode statique puis publie `apps/web/dist` sur GitHub Pages.

Pour activer Pages dans GitHub :

1. Ouvrir le dépôt sur GitHub.
2. Aller dans `Settings` puis `Pages`.
3. Dans `Build and deployment`, choisir `GitHub Actions`.
4. Pousser la branche `main`.

L’application sera publiée à cette adresse si le dépôt garde son nom actuel :

```text
https://zed-cmyk.github.io/reactive-resume/
```

Si le dépôt est renommé en `cv-studio`, il faudra aussi modifier `VITE_BASE_PATH` dans `.github/workflows/pages.yml` :

```yaml
VITE_BASE_PATH: /cv-studio/
```

L’adresse deviendra alors :

```text
https://zed-cmyk.github.io/cv-studio/
```

## Notes techniques

Le mode GitHub Pages est activé avec :

```bash
VITE_CV_STUDIO_STATIC=true
VITE_BASE_PATH=/reactive-resume/
```

Dans ce mode :

- les CV sont stockés dans le navigateur avec `localStorage` ;
- l’authentification, l’API, Postgres, Redis et le serveur ne sont pas nécessaires ;
- les exports PDF restent générés côté navigateur ;
- les templates PDF restent fournis par `packages/pdf`.

## Build de vérification

Pour vérifier le build statique si besoin :

```bash
pnpm install
pnpm build:pages
```

Le résultat est généré dans :

```text
apps/web/dist
```

