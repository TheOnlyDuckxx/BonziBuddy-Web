// Authors: Saiseevam, Tim, Noa
// Variables globales
let isBonziTalking = false;
let audioFinished = false;  
let progress = 0;
let firstTime = true;
let bonziMockingPhrases = [
    { text: "Ahaha, c'est tout ce que tu peux faire ?", audio: "/static/audio/mock1.wav" },
    { text: "Oh non, tu as perdu... Encore ?", audio: "/static/audio/mock2.wav" },
    { text: "Tu veux peut-être un mode facile ?", audio: "/static/audio/mock3.wav" },
    { text: "Oups, ça doit être gênant !", audio: "/static/audio/mock4.wav" },
    { text: "Même un singe ferait mieux !", audio: "/static/audio/mock5.wav" }
];


//Interface principale

function openWindow(id) {                       
    let win = document.getElementById(id);
    let taskIcon = document.getElementById("task-" + id);
    
    if (win) win.style.display = "block";
    if (taskIcon) taskIcon.style.display = "block";
}

function updateClock() {
    let now = new Date();
    let hours = now.getHours().toString().padStart(2, '0'); // Ajoute un zéro si nécessaire
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');

    let timeString = `${hours}:${minutes}:${seconds}`;
    document.getElementById("clock").textContent = timeString;
}

// Mettre à jour l'horloge immédiatement puis chaque seconde
setInterval(updateClock, 1000);
updateClock();

var StartMenuOpen = false;
function openStartMenu() {
    let startMenu = document.getElementById('start-menu');
    if (StartMenuOpen) {
        startMenu.style.display = "none";
        StartMenuOpen = false;
    } else {
        startMenu.style.display = "block";
        StartMenuOpen = true;
    }
}  

function closeWindow(id) {
    let win = document.getElementById(id);
    let taskIcon = document.getElementById("task-" + id);
    
    if (win) win.style.display = "none";
    if (taskIcon) taskIcon.style.display = "none";
}

function minimizeWindow(id) {
    let win = document.getElementById(id);
    if (win) win.style.display = "none";
}

function startDrag(event, id) {
    let win = document.getElementById(id);
    let shiftX = event.clientX - win.getBoundingClientRect().left;
    let shiftY = event.clientY - win.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
        win.style.left = pageX - shiftX + 'px';
        win.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('contextmenu', function stopDrag(event) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('contextmenu', stopDrag);
    });

    win.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        win.onmouseup = null;
    };
}

function toggleFullScreen(id) {
    let win = document.getElementById(id);
    if (win.classList.contains("fullscreen")) {
        win.classList.remove("fullscreen");
        win.style.width = "300px";
        win.style.height = "auto";
        win.style.top = "50px";
        win.style.left = "50px";
    } else {
        win.classList.add("fullscreen");
        win.style.width = "100vw";
        win.style.height = "100vh";
        win.style.top = "0";
        win.style.left = "0";
    }
}

//Mail

function showMessage(sender, title, body, id) {
    const emailList = document.getElementById('email-list');
    const emailContent = document.getElementById('email-content');

    emailList.style.display = 'none';
    emailContent.style.display = 'block';

    document.getElementById('email-sender').textContent = `De: ${sender}`;
    document.getElementById('email-title').textContent = title;
    document.getElementById('email-body').textContent = body;

    // 📩 Marquer l'email comme lu en session Flask
    fetch('/mark-email-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id }) // ✅ Envoie l'ID à Flask
    })
    .then(() => {
        loadEmails(); // ✅ Recharge les emails pour refléter le changement
    })
    .catch(error => console.error("Erreur lors de la mise à jour de l'email :", error));
}

function showInbox() {
    const emailList = document.getElementById('email-list');
    const emailContent = document.getElementById('email-content');

    emailList.style.display = 'block';
    emailContent.style.display = 'none';
}

document.addEventListener("DOMContentLoaded", function () {
    mailIcon = document.querySelector(".desktop-icon img[alt='Mail']");
    loadEmails();  // ✅ Charge les emails depuis le serveur
});

// 📥 Charger les emails depuis Flask
function loadEmails() {
    fetch('/get-emails')
        .then(response => response.json())
        .then(data => {
            emails = data; // 📌 Met à jour la liste des emails depuis Flask
            updateMailbox();
            updateMailIcon();
        })
        .catch(error => console.error("Erreur de récupération des emails :", error));
}

// 📩 Ajouter un email en session Flask
function receiveEmail(id, sender, subject, body) {
    let time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let newEmail = { id, sender, subject, body, time, read: false };

    fetch('/add-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmail)
    })
    .then(response => {
        if (!response.ok) {
            console.warn("L'email existe déjà !");
            return;
        }
        return response.json();
    })
    .then(() => {
        console.log("📩 Nouveau mail reçu, vérification de Bonzi...");
        loadEmails(); // ✅ Recharge les emails après ajout
        notifyBonziNewMail(); // ✅ Tente de lancer l'animation de Bonzi
    })
    .catch(error => console.error("Erreur d'ajout d'email :", error));
}


function updateMailbox() {
    let emailList = document.getElementById("email-list");
    if (!emailList) return;

    emailList.innerHTML = "";
    emails.forEach((email) => {
        let emailItem = document.createElement("div");
        emailItem.classList.add("email-item");
        emailItem.innerHTML = `
            <span class="email-sender">${email.sender}</span>
            <span class="email-subject">${email.subject}</span>
            <span class="email-date">${email.time}</span>
        `;
        emailItem.onclick = () => showMessage(email.sender, email.subject, email.body, email.id);
        emailList.appendChild(emailItem);
    });

    updateMailIcon();
}

function updateMailIcon() {
    if (!mailIcon) return;

    // 📌 Compte les emails qui ne sont pas lus
    let unreadEmails = emails.filter(email => !email.read).length;
    mailIcon.src = unreadEmails > 0 ? "/static/mail_notif.ico" : "/static/mail.ico";
}


function notifyBonziNewMail() {
    if (isBonziTalking) {
        return;
    }

    isBonziTalking = true;  
    audioFinished = false; 

    let bonzi = document.getElementById("bonzi");
    let dialogueBox = document.getElementById("dialogue-box");
    let dialogueText = document.getElementById("dialogue-text");
    let bonziAudio = document.getElementById("bonzi-audio");

    let message = "Il semblerait que tu aies un nouveau message, vérifie ta boîte mail.";

    bonzi.src = "/static/anim_bonzi/bonzi_msg.gif";
    dialogueBox.style.display = "block";
    dialogueText.textContent = "";
    bonziAudio.src = "/static/msg.wav";
    bonziAudio.play();

    bonziAudio.onloadedmetadata = function () {
        let duration = bonziAudio.duration * 1000;
        let speed = duration / message.length;
        let i = 0;

        let interval = setInterval(() => {
            if (i < message.length) {
                dialogueText.textContent += message[i];
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed);
    };

    bonziAudio.onended = () => {
        bonzi.src = "/static/anim_bonzi/bonzi_idle.gif";
        isBonziTalking = false;
        audioFinished = true;
    };

    function closeDialogueIfConditionsMet(event) {
        if (audioFinished && event.target !== bonzi && event.target !== dialogueBox) {
            dialogueBox.style.display = "none";
            saveProgress(progress); // ✅ Sauvegarde la progression avant de fermer la bulle
            document.removeEventListener("click", closeDialogueIfConditionsMet);
        }
    }

    document.addEventListener("click", closeDialogueIfConditionsMet);
}


// Navigateur

function Recherche() {
    let input = document.getElementById("Box").value.toLowerCase().trim();
    let browserContent = document.getElementById("window-content2");
    let searchContainer = document.querySelector(".search-container");
    let accueilText = document.getElementById("txt-accueil");

    // Liste des pages disponibles
    let pages = {
        "bonziblog": "bonziblog",
    };

    if (pages[input]) {
        // Charger la page dans l'iframe
        browserContent.innerHTML = `<iframe src="${pages[input]}" style="width: 100%; height: 100%; border: none;"></iframe>`;

        // Masquer l’interface du navigateur
        searchContainer.style.display = "none";
        accueilText.style.display = "none";
    } else {
        alert("Page introuvable !");
    }
}

function retourAccueil() {
    let browserContent = document.getElementById("browser-content");
    let searchContainer = document.querySelector(".search-container");
    let accueilText = document.getElementById("txt-accueil");
    let retourBtn = document.getElementById("btn-retour");

    // Réafficher l'interface du navigateur
    browserContent.innerHTML = "<p>Résultats de recherche...</p>";
    searchContainer.style.display = "block";
    accueilText.style.display = "block";
    retourBtn.style.display = "none"; // Cacher le bouton retour
}



// Bonzi Buddy

document.addEventListener("DOMContentLoaded", function () {
    let bonzi = document.getElementById("bonzi");
    let dialogueBox = document.getElementById("dialogue-box");
    let dialogueText = document.getElementById("dialogue-text");
    let bonziAudio = document.getElementById("bonzi-audio");

    let dialogues = [
        { text: "Bonjour ! Je suis BonziBuddy, ton nouvel assistant virtuel.", audio: "/static/audio1.wav", animation: "/static/anim_bonzi/bonzi_talk.gif" },
        { text: "Je peux t'aider à naviguer ici, ou peut-être que tu cherches quelque chose de précis ?", audio: "/static/audio2.wav", animation: "/static/anim_bonzi/bonzi_talk.gif" },
        { text: "D'accord, je vais t'expliquer comment fonctionnent les choses ici !", audio: "/static/audio3.wav", animation: "/static/anim_bonzi/bonzi_talk.gif" },
        { text: "Hmm... quelque chose me dit que tu as des questions... ", audio: "/static/audio4.wav", animation: "/static/anim_bonzi/bonzi_talk.gif" },
        { text: "On dirait que tu as compris, je vais te laisser explorer un peu.", audio: "/static/audio5.wav", animation: "/static/anim_bonzi/bonzi_idle.gif" }
    ];

    let currentInterval = null;
    let progress = 0;  
    let firstTime = true;  
    let audioFinished = false; 


    fetch('/get-bonzi-progress')
    .then(response => response.json())
    .then(data => {
        progress = data.progress;
        firstTime = data.first_time;

        if (firstTime) {
            startBonziIntro();
        } else {
            bonzi.src = "/static/anim_bonzi/bonzi_idle.gif";
        }
    });

    function startBonziIntro() {
        bonzi.src = "/static/anim_bonzi/bonzi_enter.gif";

        setTimeout(() => {
            bonzi.src = "/static/anim_bonzi/bonzi_hay.gif";  

            bonzi.onclick = () => {
                if (!isBonziTalking) {
                    playDialogue(progress);
                }
            };
        }, 3000);
    }

    function playDialogue(index) {
        if (index >= dialogues.length || isBonziTalking) return;
    
        let dialogue = dialogues[index];
    
        if (!dialogue || !dialogue.text) {
            console.error("Erreur : Texte de dialogue non défini pour l'index", index);
            return;
        }
        
        isBonziTalking = true; // ✅ Bloque les autres dialogues pendant que Bonzi parle
        audioFinished = false; // ✅ Reset pour permettre de fermer la bulle au bon moment
        
        bonzi.src = dialogue.animation;
        dialogueBox.style.display = "block";
        dialogueText.textContent = "";
        bonziAudio.src = dialogue.audio;
        bonziAudio.play();
    
        bonziAudio.onloadedmetadata = function () {
            let duration = bonziAudio.duration * 1000;
            let speed = duration / dialogue.text.length;
            let i = 0;
    
            let interval = setInterval(() => {
                if (i < dialogue.text.length) {
                    dialogueText.textContent += dialogue.text[i];
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, speed);
        };
    
        bonziAudio.onended = () => {
            bonzi.src = "/static/anim_bonzi/bonzi_idle.gif";
            isBonziTalking = false; // ✅ Autorise le prochain dialogue une fois l'audio terminé
            audioFinished = true; // ✅ Permet de fermer la bulle si les conditions sont remplies
        };
    
        // ✅ Seul le clic après la fin de l'audio permet d'avancer
        bonzi.onclick = () => {
            if (!isBonziTalking && progress < dialogues.length - 1) {
                progress++;
                saveProgress(progress);
                playDialogue(progress);
            }
        };
    
        document.addEventListener("click", closeDialogueIfConditionsMet);
    }

    function bonziMockPlayer() {
        if (isBonziTalking) return; // 📌 Ne pas interrompre Bonzi s'il parle déjà
    
        let randomMock = bonziMockingPhrases[Math.floor(Math.random() * bonziMockingPhrases.length)]; // 📌 Choisir une phrase aléatoire
    
        isBonziTalking = true;
        audioFinished = false;
    
        let bonzi = document.getElementById("bonzi");
        let dialogueBox = document.getElementById("dialogue-box");
        let dialogueText = document.getElementById("dialogue-text");
        let bonziAudio = document.getElementById("bonzi-audio");
    
        bonzi.src = "/static/anim_bonzi/bonzi_talk.gif"; // 📌 Animation de moquerie
        dialogueBox.style.display = "block";
        dialogueText.textContent = "";
        bonziAudio.src = randomMock.audio;
        bonziAudio.play();
    
        bonziAudio.onloadedmetadata = function () {
            let duration = bonziAudio.duration * 1000;
            let speed = duration / randomMock.text.length;
            let i = 0;
    
            let interval = setInterval(() => {
                if (i < randomMock.text.length) {
                    dialogueText.textContent += randomMock.text[i];
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, speed);
        };
    
        bonziAudio.onended = () => {
            bonzi.src = "/static/anim_bonzi/bonzi_idle.gif";
            isBonziTalking = false;
            audioFinished = true;
        };
    
        document.addEventListener("click", closeDialogueIfConditionsMet);
    }


    function closeDialogueIfConditionsMet(event) {
        if (audioFinished && event.target !== bonzi && event.target !== dialogueBox) {
            dialogueBox.style.display = "none";
            saveProgress(progress); // ✅ Sauvegarde la progression avant de fermer la bulle
            document.removeEventListener("click", closeDialogueIfConditionsMet);
        }
    }

    bonzi.onclick = () => {
        if (!isBonziTalking && dialogueBox.style.display === "none") {
            console.log("▶️ Bonzi continue avec le dialogue :", progress);
            playDialogue(progress);
        }
    };


    function saveProgress(step) {
        fetch('/update-bonzi-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ progress: step })
        }).catch(error => console.error("Erreur de sauvegarde de la progression :", error));
    }
});
