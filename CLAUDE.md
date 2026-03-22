# CLAUDE.md

Ce fichier fournit des instructions à Claude Code (claude.ai/code) pour travailler avec ce dépôt.

## Projet

**MonPortfolio** — site portfolio statique personnel. Pas de framework, pas d'étape de build. Ouvrir `index.html` directement dans un navigateur.

## Stack

- HTML, CSS, JavaScript vanilla
- Pas de bibliothèques ni de frameworks
- CSS custom properties pour le thème (fond sombre, définies dans `:root`)

## Interdictions absolues

- Ne jamais lire `~/.ssh/`
- Ne jamais lire `.env` ou tout fichier contenant des credentials
- Ne jamais exécuter `rm -rf`, `sudo`, ou `curl` vers des URL inconnues
- Ne jamais committer de fichiers `.env` ou credentials

## Conventions

- **Code en anglais** : noms de variables, fonctions, classes CSS, commentaires
- **Contenu visible en français** : tout le texte affiché à l'utilisateur
- **Design** : minimaliste, professionnel, thème sombre, mobile-first (styler d'abord les petits écrans, utiliser les media queries `min-width` pour les grands écrans)
