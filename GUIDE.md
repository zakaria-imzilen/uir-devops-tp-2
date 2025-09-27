# GUIDE.md

# Guide pour exécuter le script Selenium

Ce projet contient un script Python pour automatiser les interactions sur l'application locale.
Le script génère un **rapport de test** et prend des **captures d’écran** en cas d’erreur.

---

## Prérequis

Avant de lancer le script, assurez-vous d’avoir :

1. **Python 3 installé**
   Vérifiez avec :

   ```bash
   python --version
   ```

2. **pip installé**
   Vérifiez avec :

   ```bash
   pip --version
   ```

3. **Chrome installé** sur votre machine.

4. **ChromeDriver correspondant à votre version de Chrome**

   * Télécharger depuis : [https://sites.google.com/chromium.org/driver/](https://sites.google.com/chromium.org/driver/)
   * Ajouter `chromedriver` au PATH ou placer dans le même dossier que le script.

---

## Installation des dépendances

Ouvrir un terminal et exécuter :

```bash
pip install selenium
```

Si vous souhaitez gérer les versions plus facilement, vous pouvez créer un environnement virtuel :

```bash
python -m venv venv
source venv/bin/activate  # Linux / macOS
venv\Scripts\activate     # Windows
pip install selenium
```

---

## Structure du projet

```
app/
├── script_selenium.py       # Script principal
├── screenshots/             # Captures d’écran en cas d’erreur
├── rapport_test_<date>.txt  # Rapports générés automatiquement
├── GUIDE.md                 # Ce guide
```

---

## Exécution du script

1. Ouvrir un terminal dans le dossier du projet.
2. Lancer le script :

```bash
python script_selenium.py
```

3. Le script va :

   * Ouvrir le navigateur Chrome et naviguer vers `http://localhost:3002`
   * Effectuer toutes les étapes définies dans le script
   * Générer un rapport avec les statuts **OK/KO** dans `rapport_test_<date>.txt`
   * Sauvegarder les captures d’écran en cas d’erreur dans le dossier `screenshots/`

---

## Conseils

* Ne fermez pas le navigateur pendant l’exécution.
* Si le script échoue sur une étape, une capture d’écran sera sauvegardée et le rapport indiquera l’erreur.
* Pour refaire un test, il suffit de relancer le script. Chaque rapport aura un nom unique avec la date et l’heure.

