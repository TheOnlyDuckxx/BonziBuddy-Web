from flask import Flask, render_template, request, jsonify, session
import os


app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 5*1024*1024
app.secret_key = os.urandom(24) 

nom='Bonzi'
prenom='Buddy'
age='99'
sexe='Singe'
screenshot = 'N'

@app.route('/mark-email-read', methods=['POST'])
def mark_email_read():
    email_id = request.json.get("id")
    emails = session.get("emails", [])

    for email in emails:
        if email["id"] == email_id:
            email["read"] = True  # ✅ Met à jour l’état de l’email
            break

    session["emails"] = emails  # ✅ Sauvegarde la session mise à jour
    return jsonify({"message": "Email marqué comme lu"})

@app.route('/reset-emails')
def reset_emails():
    session["emails"] = []  # ✅ Vide la liste des emails au démarrage du serveur
    return jsonify({"reset": True})

@app.route('/get-emails')
def get_emails():
    emails = session.get("emails", [])  # Récupère les emails stockés
    return jsonify(emails)

@app.route('/add-email', methods=['POST'])
def add_email():
    email_data = request.json
    emails = session.get("emails", [])
    
    # Empêche les doublons
    if any(email["id"] == email_data["id"] for email in emails):
        return jsonify({"message": "Email déjà existant"}), 400
    
    emails.append(email_data)
    session["emails"] = emails  # ✅ Sauvegarde en session
    return jsonify({"message": "Email ajouté"}), 200

@app.route('/BonziWorld', methods=['POST'])
def bonziworld():
    global nom, prenom, age, sexe, screenshot
    nom = request.form.get('nom')
    prenom = request.form.get('prenom')
    age = request.form.get('age')
    sexe = request.form.get('sexe')
    screenshot = request.form.get('screenshot-data')
    
    print(f"Nom: {nom}, Prénom: {prenom}, Âge: {age}, Sexe: {sexe}")
    if screenshot:
        print("Capture d'écran reçue.")

    return render_template('bonziworld.html', nom=nom, prenom=prenom, age=age, sexe=sexe, screenshot=screenshot)
    
@app.route('/BonziWorld')
def bonziworld2():
    global nom, prenom, age, sexe, screenshot
    return render_template('bonziworld.html', nom=nom, prenom=prenom, age=age, sexe=sexe)

@app.route('/')
def accueil():
    return render_template('accueil.html')

@app.route('/inscription')
def inscription():
    return render_template('inscription.html')

@app.route('/connexion')
def login():
    return render_template('connexion.html')

@app.route('/bonziblog')
def blog():
    return render_template('bonziblog.html')

@app.route('/BonzIw0rld')
def terminal():
    return render_template('terminal.html')

@app.route('/identite')
def identite():
    global nom, prenom, age, sexe, screenshot
    return render_template('identite.html', nom=nom, prenom=prenom, annee=2025-int(age), sexe=sexe, jour=1, mois=1, taille="1m70", screenshot=screenshot)

@app.route('/jeu')
def index():
    return render_template('jeu.html')

@app.route('/get-bonzi-progress')
def get_bonzi_progress():
    progress = session.get("bonzi_progress", 0)  # Étape actuelle du dialogue
    first_time = session.get("first_time", True)  # Vérifie si c'est la première fois

    return jsonify({"progress": progress, "first_time": first_time})

@app.route('/update-bonzi-progress', methods=['POST'])
def update_bonzi_progress():
    data = request.json
    session["bonzi_progress"] = data.get("progress", 0)
    session["first_time"] = False  # Une fois qu'on a vu l'intro, on met False
    return jsonify({"message": "Progression mise à jour"})
if __name__ == '__main__':
    app.run(debug=True)