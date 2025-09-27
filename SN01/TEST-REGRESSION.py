from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import os
from datetime import datetime

# Configuration
URL = "http://localhost:3002"
SCREENSHOT_DIR = "screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

# Générer un nom de rapport avec date et heure
now = datetime.now().strftime("%Y%m%d_%H%M%S")
REPORT_FILE = f"rapport_test_{now}.txt"

# Initialisation du driver
driver = webdriver.Chrome()  # Assure-toi d'avoir ChromeDriver dans ton PATH
driver.maximize_window()
driver.get(URL)
time.sleep(3)  # Pause initiale pour le chargement de la page

# Liste complète des étapes avec XPath et action
steps = [
    {"desc": "Clique sur lien 1", "xpath": "/html/body/div[2]/div[3]/div/div/div[4]/a[2]", "action": "click"},
    {"desc": "Clique sur lien 2", "xpath": "/html/body/div[2]/div[3]/div/div/div[1]/div[2]/div[3]/a", "action": "click"},
    {"desc": "Remplir email", "xpath": '//*[@id="email"]', "action": "fill", "value": "salma.ky109@gmail.com"},
    {"desc": "Remplir password", "xpath": '//*[@id="password"]', "action": "fill", "value": "Lina123@"},
    {"desc": "Clique bouton login", "xpath": "/html/body/div[2]/div[3]/div/div/div[1]/div[2]/div[1]/button", "action": "click"},
    {"desc": "Clique lien suivant", "xpath": "/html/body/div[2]/div[7]/main/div[1]/div/a", "action": "click"},
    {"desc": "Remplir app name", "xpath": '//*[@id="app-name"]', "action": "fill", "value": "TESTPROJECT"},
    {"desc": "Clique bouton 3", "xpath": "/html/body/div[2]/div[1]/div[2]/button[3]", "action": "click"},
    {"desc": "Clique bouton 1", "xpath": "/html/body/div[2]/div[1]/div[2]/button[1]", "action": "click"},

    {"desc": "Clique lien suivant", "xpath": "/html/body/div[2]/div[7]/main/div[1]/div/a", "action": "click"},
    {"desc": "Remplir app name", "xpath": '//*[@id="app-name"]', "action": "fill", "value": "TESTPROJECT"},
    {"desc": "Clique bouton 3", "xpath": "/html/body/div[2]/div[1]/div[2]/button[3]", "action": "click"},
    {"desc": "Clique bouton 1", "xpath": "/html/body/div[2]/div[1]/div[2]/button[1]", "action": "click"},

]

# Liste pour stocker les résultats
results = []

# Exécution des étapes avec capture d'écran et pause
for i, step in enumerate(steps, start=1):
    try:
        element = driver.find_element(By.XPATH, step["xpath"])
        if step["action"] == "click":
            element.click()
        elif step["action"] == "fill":
            element.clear()
            element.send_keys(step["value"])
        print(f"Étape {i} réussie : {step['desc']}")
        results.append({"étape": step["desc"], "status": "OK"})
        time.sleep(3)  # Pause de 3 secondes entre chaque étape
    except Exception as e:
        screenshot_path = os.path.join(SCREENSHOT_DIR, f"erreur_etape_{i}.png")
        driver.save_screenshot(screenshot_path)
        print(f"Erreur à l'étape {i} ({step['desc']}): {e}")
        print(f"Capture d'écran sauvegardée : {screenshot_path}")
        results.append({"étape": step["desc"], "status": "KO", "erreur": str(e), "screenshot": screenshot_path})
        break  # Arrête le script si une étape échoue

# Fin du script
driver.quit()

# Générer le rapport final avec date de création
with open(REPORT_FILE, "w", encoding="utf-8") as f:
    f.write(f"=== Rapport du test Selenium ===\n")
    f.write(f"Date de création : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    for i, result in enumerate(results, start=1):
        status_line = f"Étape {i}: {result['étape']} -> {result['status']}"
        f.write(status_line + "\n")
        if result['status'] == "KO":
            f.write(f"  Erreur : {result['erreur']}\n")
            f.write(f"  Screenshot : {result['screenshot']}\n")
    f.write("\nFin du test.\n")

print(f"Rapport généré : {REPORT_FILE}")
