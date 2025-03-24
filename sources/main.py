from flask import Flask, render_template, request, jsonify, session
import os


app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 5*1024*1024
app.secret_key = os.urandom(24) 

# Définition des variables
nom='Bonzi'
prenom='Buddy'
age='99'
sexe='Singe'
screenshot = '/static/img/bonzi.jpg'
taille = "Inconnue"
anniversaire = "??"
bonzi_game_finished = False
admin = False


@app.route('/mark-email-read', methods=['POST'])
def mark_email_read():
    email_id = request.json.get("id")
    emails = session.get("emails", [])

    for email in emails:
        if email["id"] == email_id:
            email["read"] = True
            break

    session["emails"] = emails
    return jsonify({"message": "Email marqué comme lu"})

@app.route('/reset-emails')
def reset_emails():
    session["emails"] = []
    return jsonify({"reset": True})

@app.route('/get-emails')
def get_emails():
    emails = session.get("emails", [])
    return jsonify(emails)

@app.route('/add-email', methods=['POST'])
def add_email():
    email_data = request.json
    emails = session.get("emails", [])
    
    if any(email["id"] == email_data["id"] for email in emails):
        return jsonify({"message": "Email déjà existant"}), 400
    
    emails.append(email_data)
    session["emails"] = emails
    return jsonify({"message": "Email ajouté"}), 200

@app.route('/BonziWorld', methods=['POST'])
def bonziworld():
    global nom, prenom, age, sexe, screenshot, admin
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
    return render_template('bonziworld.html', nom=nom, prenom=prenom, age=age, sexe=sexe, screenshot=screenshot)

@app.route('/credit')
def credit():
    return render_template('end_page.html')


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

@app.route('/wiki')
def wiki():
    return render_template('wiki.html')

@app.route('/BonzIw0rld', methods=['GET'])
def BonzIw0rld():
    global nom, prenom, age, sexe, admin
    admin = True
    return render_template('bonziworld.html', nom=nom, prenom=prenom, age=age, sexe=sexe, admin=admin)

@app.route('/terminal')
def terminal():
    return render_template('terminal.html')

@app.route('/identite')
def identite():
    global nom, prenom, age, sexe, screenshot, taille, anniversaire
    return render_template('identite.html', nom=nom, prenom=prenom, annee=2025-int(age), sexe=sexe, anniversaire=anniversaire, taille=taille, screenshot=screenshot)

@app.route('/jeu')
def index():
    return render_template('jeu.html')

@app.route('/set-bonzi-game-finished', methods=['POST'])
def set_bonzi_game_finished():
    global bonzi_game_finished
    bonzi_game_finished = True
    return jsonify({"message": "Bonzi game marked as finished."})

@app.route('/get-bonzi-game-status', methods=['GET'])
def get_bonzi_game_status():
    return jsonify({"bonzi_game_finished": bonzi_game_finished})

@app.route('/reset-bonzi-game', methods=['POST'])
def reset_bonzi_game():
    """ Réinitialise l'état du jeu à False quand une nouvelle partie commence """
    global bonzi_game_finished
    bonzi_game_finished = False
    return jsonify({"message": "Bonzi game reset."})

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

@app.route('/update-bonzi-data', methods=['POST'])
def update_bonzi_data():
    global taille, anniversaire
    data = request.json
    field = data.get("field")
    value = data.get("value")

    if field == "taille":
        taille = value
    elif field == "anniversaire":
        anniversaire = value

    return jsonify({"message": f"{field} mis à jour avec succès."})

if __name__ == '__main__':
    app.run(debug=True)