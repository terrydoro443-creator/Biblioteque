# Bibliothèque

Petit site pour enregistrer les emprunts de livres à l'école : numéro d'ordre de l'élève, nom de l'élève et titre du livre emprunté.

## Utilisation

Ouvrir `index.html` dans un navigateur (aucune installation nécessaire). Les emprunts sont sauvegardés dans le navigateur (`localStorage`) et peuvent être exportés en CSV.

Pour le servir en local :

```bash
python3 -m http.server 8000
```

puis ouvrir http://localhost:8000
