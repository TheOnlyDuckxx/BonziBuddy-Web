// Authors: Saiseevam, Tim, Noa
// Attention ce fichier contient des spoils majeur !
// Il est recommandé de ne pas le lire si vous n'avez pas encore fini le jeu.



// Variables globales

let bonziGameFinished = false;
let bonziTestFinished = false;
let cmdOpen = false;
let isBonziTalking = false;
let audioFinished = false;  
let isProgressing = false;
let progress = 0;
let adminpassed = false;
let firstTime = true;
let bonziMockingPhrases = [
    { text: "Tu le fais exprès ou quoi ?", audio: "/static/audio/mock1.wav" },
    { text: "Encore perdu... Il faut juste sauter !", audio: "/static/audio/mock2.wav" },
    { text: "Tu veux peut-être un mode facile ?", audio: "/static/audio/mock3.wav" },
    { text: "Oups, ça doit être gênant !", audio: "/static/audio/mock4.wav" },
    { text: "Même un singe ferait mieux !", audio: "/static/audio/mock5.wav" }
];


//Interface principale

window.addEventListener("keydown", function (e) {
    if (e.code === "Space" ) {
        e.preventDefault();
    }

    if (e.code === "Enter") {
        e.preventDefault();
    }
});


function openWindow(id) {                       
    let win = document.getElementById(id);
    let taskIcon = document.getElementById("task-" + id);
    
    if (win) win.style.display = "block";
    if (taskIcon) taskIcon.style.display = "block";
    if (id=="app7" && cmdOpen==false) {
        playSpeDialogue("ARRETE TOUT DE SUITE ! IL N'Y A RIEN A VOIR ICI DE TOUTE FACON !","/static/audio/cmd.wav","/static/anim_bonzi/bonzi_talk.gif");
        closeWindow('app7')
        cmdOpen = true
    }
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
    let glitchsound = document.getElementById("glitch-sound");
    let win = document.getElementById(id);
    let taskIcon = document.getElementById("task-" + id);
    
    if (win) win.style.display = "none";
    if (taskIcon) taskIcon.style.display = "none";

    if (id === "app4") {
        glitchsound.pause();
        glitchsound.currentTime = 0;
    }
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

    // Marquer l'email comme lu en session Flask
    fetch('/mark-email-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id }) // Envoie l'ID à Flask
    })
    .then(() => {
        loadEmails(); // Recharge les emails pour refléter le changement
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
    loadEmails();  // Charge les emails depuis le serveur
});

// Charger les emails depuis Flask
function loadEmails() {
    fetch('/get-emails')
        .then(response => response.json())
        .then(data => {
            emails = data; // Met à jour la liste des emails depuis Flask
            updateMailbox();
            updateMailIcon();
        })
        .catch(error => console.error("Erreur de récupération des emails :", error));
}

// Ajouter un email en session Flask
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
        console.log("Nouveau mail reçu, vérification de Bonzi...");
        loadEmails(); // Recharge les emails après ajout
        notifyBonziNewMail(); // Tente de lancer l'animation de Bonzi
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

    // Compte les emails qui ne sont pas lus
    let unreadEmails = emails.filter(email => !email.read).length;
    mailIcon.src = unreadEmails > 0 ? "/static/img/mail_notif.ico" : "/static/img/mail.ico";
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
    bonziAudio.src = "/static/audio/msg.wav";
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

        audioFinished = true;
    };

    bonziAudio.onended = () => {
        bonzi.src = "/static/anim_bonzi/bonzi_idle.gif";
        isBonziTalking = false;
       
    };

    function closeDialogueIfConditionsMet(event) {
        if (audioFinished && event.target !== bonzi && event.target !== dialogueBox) {
            dialogueBox.style.display = "none"; 
            document.removeEventListener("click", closeDialogueIfConditionsMet);
        }
    }

    document.addEventListener("click", closeDialogueIfConditionsMet);
}


// Navigateur

function Recherche() {
    let input = document.getElementById("Box").value.toLowerCase().trim();
    let browserContent = document.getElementById("window-content2");
    let retourBtn = document.getElementById("btn-retour");

    // Vérifier que les éléments existent avant d'agir
    if (!browserContent || !retourBtn) {
        console.error("Erreur : Un ou plusieurs éléments sont introuvables !");
        return;
    }

    // Liste des pages disponibles
    let pages = {
        "bonziblog": "bonziblog",
        "bonzibuddy": "wiki"
    };

    if (pages[input]) {
        // Remplacement complet de `window-content2`
        browserContent.innerHTML = `
            <iframe src="${pages[input]}" style="width: 100%; height: 100%; border: none;"></iframe>
        `;

        // Rendre le bouton retour visible
        retourBtn = document.getElementById("btn-retour"); // Re-récupérer le bouton car il vient d'être recréé
        retourBtn.style.display = "block";
    } else {
        alert("Page introuvable !");
    }
}

function retourAccueil() {
    let browserContent = document.getElementById("window-content2");

    if (!browserContent) {
        console.error("Erreur : `window-content2` est introuvable !");
        return;
    }

    // Restaurer l'accueil complet
    browserContent.innerHTML = `
        <img id="bonzinet_img" src="../static/img/tete_bonzi.png" alt="Bonzi" width="200" height="200">
        <h1 id="txt-accueil">Bienvenue sur BonziNet !</h1>
        <br>
        <div class="search-container">
            <input id="Box" type="text" placeholder="Entrez un mot-clé...">
            <img id="loupe" src="../static/img/search.ico" onclick="Recherche()">
        </div>
        <br>
        <h2 style="font-size: 10px;">Les recherches se font en minuscules</h2>
        <button id="btn-retour" onclick="retourAccueil()" style="display: none;">⬅ Retour</button>
    `;

    // Re-récupérer `btn-retour` après réécriture de `innerHTML`
    let retourBtn = document.getElementById("btn-retour");
    retourBtn.style.display = "none"; // Le cacher à nouveau
}



// Bonzi Buddy

document.addEventListener("DOMContentLoaded", function () {
    let bonzi = document.getElementById("bonzi");
    let dialogueBox = document.getElementById("dialogue-box");
    let dialogueText = document.getElementById("dialogue-text");
    let bonziAudio = document.getElementById("bonzi-audio");

    let dialogues = [
        { text: "Bonjour ! Je suis BonziBuddy, ton nouvel assistant virtuel.", audio: "/static/audio/audio1.wav", animation: "/static/anim_bonzi/bonzi_talk.gif" },
        { text: "Je suis à la pointe de la technologie et je peux faire plein de choses !", audio: "/static/audio/audio2.wav", animation: "/static/anim_bonzi/bonzi_talk.gif" },
        { text: "J'ai conçu cet environnement spécialement pour toi, tu y trouveras plein d'activités amusantes !", audio: "/static/audio/audio3.wav", animation: "/static/anim_bonzi/bonzi_talk.gif", action: function() { receiveEmail('firstMail', '????', 'P!ç^jieqé', 'Pourquoi es-tu venu, tu n\'aurais jamais du faire revenir Bonzi !'); } },
        { text: "Mais si tu veux que ce soit encore mieux, il faut que j'en sache un peu plus sur toi !", audio: "/static/audio/audio4.wav", animation: "/static/anim_bonzi/bonzi_talk.gif" },
        { text: "Pour que je puisse m'adapter et ajouter de nouvelles fonctionnalités, il te suffit de répondre à quelques questions. ", audio: "/static/audio/audio5.wav", animation: "/static/anim_bonzi/bonzi_talk.gif", action: function() { openWindow('app4'); } },
        { text: "Super ! Maintenant que tu as répondu, je vais pouvoir me mettre à préparer une petite surprise rien que pour toi !", audio: "/static/audio/audio6.wav", animation: "/static/anim_bonzi/bonzi_talk.gif", action: function() { receiveEmail('secondMail', '????', 'Bonzi', 'Stoppe immédiatement toute interaction avec Bonzi. Il est malveillant et peut causer des dégâts irréversibles. Si tu continues à communiquer avec lui, il sera trop tard pour éviter les conséquences. Prends ce message au sérieux. Ne tentes pas de contourner cette alerte.'); } },
        { text: "Le temps que je termine, tu peux explorer l'environnement que j'ai créé pour toi !", audio: "/static/audio/audio7.wav", animation: "/static/anim_bonzi/bonzi_talk.gif", action: function() { startProgressBar(); } },
        { text: "Voilà, c'est prêt ! Tu veux découvrir ce que j'ai préparé ?", audio: "/static/audio/audio8.wav", animation: "/static/anim_bonzi/bonzi_talk.gif",  },
        { text: "Regarde, c'est très simple : il te suffit d'avancer en appuyant sur Z !", audio: "/static/audio/audio9.wav", animation: "/static/anim_bonzi/bonzi_talk.gif", action: function() { openWindow('app5'); }},
        { text: "Je... Je suis désolé, tu n'étais pas censé voir ça...", audio: "/static/audio/audio10.wav", animation: "/static/anim_bonzi/bonzi_talk.gif", action: function() { receiveEmail('thirdMail', '????', 'Bonzi', 'Si tu veux comprendre ce qui se cache réellement derrière Bonzi, je te conseille de faire une recherche sur "Bonziblog" dans ton moteur de recherche. Tu y trouveras toutes les informations nécessaires pour comprendre la vérité sur cet assistant virtuel et les risques qu\'il représente. Ne prends pas ce conseil à la légère.'); } },
        { text: "Je suis là pour toi, tout le temps. Vraiment tout le temps.", audio: "/static/audio/audio11.wav", animation: "/static/anim_bonzi/bonzi_talk.gif" },
        { text: "Tu sais... J\'aime apprendre des choses sur toi. C\'est fascinant.", audio: "/static/audio/audio12.wav", animation: "/static/anim_bonzi/bonzi_talk.gif"},
        { text: "Oh ! J\'ai oublié de te montrer ta carte d\'identité... J\'ai tout enregistré ! Comme ça on ne se cache plus rien", audio: "/static/audio/audio13.wav", animation: "/static/anim_bonzi/bonzi_talk.gif", action: function() { openWindow('app6'); } },
        { text: "Je suis un peu fatigué ; je vais me reposer un peu...", audio: "/static/audio/audio14.wav", animation: "/static/anim_bonzi/bonzi_talk.gif"},
        { text: "Tu n'es pas censé être ici !!! Comment es-tu arrivé là ?!", audio: "/static/audio/audio15.wav", animation: "/static/anim_bonzi/bonzi_talk.gif"},
        { text: "C'est surement un bug... N'y fais pas attention et surtout ne touche à rien ; ça pourrait être dangereux !", audio: "/static/audio/audio16.wav", animation: "/static/anim_bonzi/bonzi_talk.gif"},
        // { text: "placeholder", audio: "/static/audio/audio17.wav", animation: "/static/anim_bonzi/bonzi_talk.gif"},
        // { text: "placeholder", audio: "/static/audio/audio18.wav", animation: "/static/anim_bonzi/bonzi_talk.gif"},
        // { text: "placeholder", audio: "/static/audio/audio19.wav", animation: "/static/anim_bonzi/bonzi_talk.gif"},
    ];

    let currentInterval = null;
    progress = 14;  
    let firstTime = true;  
    let audioFinished = false; 

    fetch('/get-bonzi-progress')
    .then(response => response.json())
    .then(data => {
        progress = data.progress;
        firstTime = data.first_time;

        if (firstTime) {
            startBonziIntro();
        } 
        if (admin && !adminpassed) {
            bonzi.src = "/static/anim_bonzi/bonzi_shocked.gif";
            adminpassed = true
        } 
        else {
            bonzi.src = "/static/anim_bonzi/bonzi_idle.gif";
        }


    });

    function startBonziIntro() {
        
        setTimeout(() => {
            bonzi.src = "/static/anim_bonzi/bonzi_enter.gif";

            setTimeout(() => {
                bonzi.src = "/static/anim_bonzi/bonzi_hay.gif";  

                bonzi.onclick = () => {
                    if (!isBonziTalking) {
                        playDialogue(progress);
                    }
                };
            }, 3000);
        }, 5000);
    }

    function playDialogue(index) {
        if (index >= dialogues.length || isBonziTalking) return;
    
        // Bloquer la progression tant que le test n'est pas fini
        if (index == 5 && !bonziTestFinished) {
            progress = 4; // On force à rester sur le dialogue 5
            playDialogue(4);
            return;
        }
    
        // Bloquer la progression tant que la barre de progression n'est pas terminée
        if (index == 7 && isProgressing) {
            progress = 6;
            playDialogue(6);
            return;
        }

        if (index == 9 && !bonziGameFinished) {
            progress = 8;
            playDialogue(8);
            return;
        }

        if (index == 14 && !admin ){
            progress = 13;
            playDialogue(14);
            return
        }
    
        let dialogue = dialogues[index];
    
        if (!dialogue || !dialogue.text) return;
    
        isBonziTalking = true;
        audioFinished = false;
        
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
            if (index==6){bonzi.src = "/static/anim_bonzi/bonzi_note.gif";} 
            if (index==13){bonzi.src = "/static/anim_bonzi/bonzi_sleep.gif"}
            else {bonzi.src = "/static/anim_bonzi/bonzi_idle.gif";}
    
            if (dialogue.action) {
                dialogue.action();
            }

            isBonziTalking = false;
            audioFinished = true;
        };
    
        bonzi.onclick = () => {
            if (!isBonziTalking && progress < dialogues.length - 1) {
                progress++;
                saveProgress(progress);
                playDialogue(progress);
            }
        };
    
        document.addEventListener("click", closeDialogueIfConditionsMet);
    }

    function closeDialogueIfConditionsMet(event) {
        if (audioFinished && event.target !== bonzi && event.target !== dialogueBox) {
            dialogueBox.style.display = "none";
            saveProgress(progress);
            document.removeEventListener("click", closeDialogueIfConditionsMet);
        }
    }

    bonzi.onclick = () => {
        if (!isBonziTalking) {
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


// Pour jouer des dialogues spécieux en dehors de la séquence principale
function playSpeDialogue(texte, audio, anim) {

    isBonziTalking = true;
    audioFinished = false;

    let bonzi = document.getElementById("bonzi");
    let dialogueBox = document.getElementById("dialogue-box");
    let dialogueText = document.getElementById("dialogue-text");
    let bonziAudio = document.getElementById("bonzi-audio");

    bonzi.src = anim;
    dialogueBox.style.display = "block";
    dialogueText.textContent = ""; // Efface le texte précédent
    bonziAudio.src = audio;
    bonziAudio.play();

    bonziAudio.onloadedmetadata = function () {

        let duration = bonziAudio.duration * 1000;
        let speed = duration / texte.length;

        let i = 0;
        let interval = setInterval(() => {
            if (i < texte.length) {
                dialogueText.textContent += texte[i];
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed);
    };

    bonziAudio.onended = () => {
        bonzi.src = "/static/anim_bonzi/bonzi_idle.gif";
        audioFinished = true;
        isBonziTalking = false;
    };

    function closeDialogueIfConditionsMet(event) {
        if (audioFinished && event.target !== bonzi && event.target !== dialogueBox) {
            dialogueBox.style.display = "none";
            document.removeEventListener("click", closeDialogueIfConditionsMet);
        }
    }

    document.addEventListener("click", closeDialogueIfConditionsMet);
}

function bonziMockPlayer() {
    if (isBonziTalking) return;

    let randomMock = bonziMockingPhrases[Math.floor(Math.random() * bonziMockingPhrases.length)];

    isBonziTalking = true;
    audioFinished = false;

    let bonzi = document.getElementById("bonzi");
    let dialogueBox = document.getElementById("dialogue-box");
    let dialogueText = document.getElementById("dialogue-text");
    let bonziAudio = document.getElementById("bonzi-audio");

    bonzi.src = "/static/anim_bonzi/bonzi_laugh.gif";
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

        isBonziTalking = false;
    };

    bonziAudio.onended = () => {
        bonzi.src = "/static/anim_bonzi/bonzi_idle.gif";
        
        audioFinished = true;
    };

    function closeDialogueIfConditionsMet(event) {
        if (audioFinished && event.target !== bonzi && event.target !== dialogueBox) {
            dialogueBox.style.display = "none";
            document.removeEventListener("click", closeDialogueIfConditionsMet);
        }
    }

    document.addEventListener("click", closeDialogueIfConditionsMet);
}



// Bonzi Test (un peu buggé)


let bonziTestQuestions = [
    { 
        text: "Quel animal préfères-tu ?", 
        type: "image",
        options: [
            { src: "/static/img/chien.jpg", value: "chien" },
            { src: "/static/img/chat.jpg", value: "chat" },
            { src: "/static/img/singe.jpg", value: "singe" }
        ]
    },
    { text: "Quelle est ta chose préférée dans la vie ?", type: "text" },
    { text: "Quelle taille fais-tu ?", type: "text" },
    { text: "Quel est ton anniversaire ?", type: "select-date"},
    { text: "Si tu pouvais avoir un seul vœu, que serait-il ?", type: "text" },
    { text: "Qui est ton meilleur ami ?", type: "text", special1: true },
    { text: "Q̴̷̡̟͍̼̯̪̩̱͕͇̳̣̭͒̃ͩͬ̂̉ͫͬ͗͗́͒ͤͩ͢U̸̡̡̝͓̪͇̭͖̩̭͕͙͎̲͚͚̥̗̖͂̈͊̎̾ͩͮͭ͆̔̒ͮ̈̽̑͒ͤ͆ͧͧ͗̕͡ͅI̢͇̠͔͉͈͇ͨͫ̎͂͊͂̒̄ͪ͐ͮ̀_̵̨̞̻̰̫̖̰̬̙̝͍̗͚ͯ̓̿͆̃̐̈́̈́̈́ͫ͗ͬ̕ E̴̙ͮ̀͌ͨ̐͛ͯ͌S̶̵̸̨̡̢̺̬̰̜̬̺̳͙̟̺̜̳͑̋̏ͯͭ͂͒͆͌̽͘T̷̪̳̟͉͓̼̼͚͈̖̟̹̖͓͉̓̄̓̉́̀̍̈͐̏̊̇̂ͥ͡ T̟̈́_̴̢̼̮̖͇̲̗̫̭̦͎̳̖͎̖̭ͮ̊͑̔͊͛̍ͤ̓͑͛ͧͨͯ͂̌̅̅͑̕͝O̗̣͈ͦ͘_̨̨̻̟̲̬̱̫̊̂ͭ̀̀̇͋̏ͫͩ̕N̡̲͉̖̙̦̬͔̝̩̖̗͍̫̠̗ͮ͛̀̀͛̋̔͌̇̒̔ͩ̏̌͆̑́ͯ̏̓̀̕̕͢͟͝͞͠ M̡̛̪̻͎̗̝̫͓̪̳͚͑̽̌͐́͠_̷̷̸̝̻̝̩̫̪͓͍̱̯̙̹̤ͯͫ́͋̌ͧͧ̅̀͞E̜̠͐Í̷̢̡̳͍̰̝͔̙͙̯̬͍͈ͭ̂̆͌̆̓́ͩ̑̇ͩ̊̎́̎̈̾̌͡L̴̷͍̣̂̔̐̎_̵̵̨̮̯̫͍̦͖̝̰̺͇͉̠ͫ̄̀̔̎̇̾͂̆͂͒͐̐̐̚̕͘͜ͅL͎͕̦̿ͬ͗͛͘Ë̸͖̖͚̜̠̈́̎͋̆ͬ̚Ủ̡̘͚̔̂̍̕_̷̢̠̪̯̫̤̳̹́̎̇̆̾̂͢͠R̷̷̙͕̩͈̪̯͑̌̈́̎̔̑͂͑ͮ̋̐ͥ͘ A̞͕̙͚͖̮̞̠͙̺̋̊̎̋̏́̇̏́͜_M͉̮Ǐ̲̪̮͈̮̺̏̄̈́̄͛̑ͣͣ͝ ?̶̸̸̢̩̘͕͙͍͎̯̘͌ͣ̈́̔ͩ̏́̿̓͗ͫ̽̒̄ͧ̌̕͢͢͞_̧͔̕͜?̯̐̈́ͬ̌ͤ͂̎̇͡ͅͅ?̣͉̝͎̯̣̫ͯ̾̔̓", type: "text", special: true }
];

let currentQuestionIndex = 0;

function startBonziTest() {
    let app4 = document.getElementById("app4");
    let windowContent = app4.querySelector(".window-content2");
    windowContent.innerHTML = '<h2 id="question-text"></h2><div id="question-options" class="test-options"></div>'

    ;

    app4.style.display = "block";
    currentQuestionIndex = 0;
    showBonziTestQuestion();
}

function showBonziTestQuestion() {
    let question = bonziTestQuestions[currentQuestionIndex];
    let questionText = document.getElementById("question-text");
    let questionOptions = document.getElementById("question-options");

    questionText.textContent = question.text;
    questionOptions.innerHTML = "";

    if (question.type === "image") {
        question.options.forEach(option => {
            let img = document.createElement("img");
            img.src = option.src;
            img.className = "bonzi-test-img";
            img.onclick = () => nextBonziTestQuestion();
            questionOptions.appendChild(img);
        });

    } else if (question.type === "select-date") {
        let daySelect = document.createElement("select");
        daySelect.id = "day-select";
        for (let i = 1; i <= 31; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }

        let monthSelect = document.createElement("select");
        monthSelect.id = "month-select";
        for (let i = 1; i <= 12; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            monthSelect.appendChild(option);
        }

        let validateButton = document.createElement("button");
        validateButton.textContent = "Valider";
        validateButton.style.outline = "1px solid #000000";
        validateButton.style.background = "#C0C0C0";
        validateButton.style.borderWidth = "2px";
        validateButton.style.borderStyle = "solid";
        validateButton.style.borderColor = "#FFFFFF #808080 #808080 #FFFFFF";
        validateButton.onclick = () => {
            let selectedDay = daySelect.value;
            let selectedMonth = monthSelect.value;
            let formattedDate = `${selectedDay}/${selectedMonth}`;
            handleBonziTestAnswer(formattedDate);
        };

        questionOptions.appendChild(daySelect);
        questionOptions.appendChild(monthSelect);
        questionOptions.appendChild(validateButton);
    } else {
        let input = document.createElement("input");
        input.type = "text";
        input.className = "bonzi-test-input";
        input.onkeydown = (e) => {
            if (e.key === "Enter") handleBonziTestAnswer(input.value);
        };
        questionOptions.appendChild(input);
        input.focus();
    }
}

function handleBonziTestAnswer(answer) {
    let question = bonziTestQuestions[currentQuestionIndex];

    if (question.text === "Quelle taille fais-tu ?") {
        sendBonziDataToServer("taille", answer);
    }

    if (question.text === "Quel est ton anniversaire ?") {
        sendBonziDataToServer("anniversaire", answer);
    }

    if (question.special1) {
        if (answer.toLowerCase() == "bonzi" || answer.toLowerCase() == "bonzibuddy") {
            playSpeDialogue('Oh ! Merci ! Tu sais... avant toi, j\'ai eu d\'autres amis. Mais ils sont tous partis. Je ne veux pas que tu partes.','../static/audio/thanks.wav','../static/anim_bonzi/bonzi_thanks.gif');
            closeWindow("app4");
            bonziTestFinished = true;
            reloadIdentityCard();
            return;
        }

        else {
            glitchBonziTest();
            nextBonziTestQuestion();
            return;
        }
    }
    if (question.special) {
        if (answer.toLowerCase() == "bonzi" || answer.toLowerCase() == "bonzibuddy") {
            document.body.classList.remove("glitch-effect");
            playSpeDialogue('Oh ! Merci ! Tu sais... avant toi, j\'ai eu d\'autres amis. Mais ils sont tous partis. Je ne veux pas que tu partes.','../static/audio/thanks.wav','../static/anim_bonzi/bonzi_thanks.gif');
            closeWindow("app4");
            bonziTestFinished = true;
            reloadIdentityCard();
            return;
        }

        else {
            bonziType();
            return;
        }
    }


    nextBonziTestQuestion();

}

function sendBonziDataToServer(field, value) {
    fetch('/update-bonzi-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: field, value: value })
    })
    .then(response => response.json())
    .then(data => console.log("Donnée enregistrée :", data))
    .catch(error => console.error("Erreur d'envoi de donnée :", error));
}

function nextBonziTestQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= bonziTestQuestions.length) {
        closeWindow("app4");
        bonziTestFinished = true;
        reloadIdentityCard();
        return;
    }
    showBonziTestQuestion();
}

function glitchBonziTest() {
    let body = document.body;
    glitchAudio.play().catch(error => console.error("Erreur de lecture de l'audio :", error));
    body.classList.add("glitch-effect");
}

function bonziType() {
    let inputField = document.querySelector("#question-options input");
    inputField.value = "";
    inputField.style.color = "red";
    inputField.style.textTransform = "uppercase";
    
    let body = document.body;

    setTimeout(() => {
        inputField.placeholder = "BONZIBUDDY !";
        let interval = setInterval(() => {
            if (inputField.value.length < 10) {
                inputField.value += "BONZIBUDDY"[inputField.value.length];
            } else {
                clearInterval(interval);
                setTimeout(() => closeWindow("app4"), 1000);
                setTimeout(() => body.classList.remove("glitch-effect"), 1500);
            }
        }, 100);
        
    }, 1000);

    bonziTestFinished = true; 
    
}

function glitchBonziTest() {
    let body = document.body;
    let glitchsound = document.getElementById("glitch-sound");
    body.classList.add("glitch-effect");
    glitchsound.play()
}

function bonziType() {
    let inputField = document.querySelector("#question-options input");
    inputField.value = "";
    inputField.style.color = "red";
    inputField.style.textTransform = "uppercase";
    inputField.placeholder = "BONZIBUDDY !";
    let body = document.body;

    setTimeout(() => {
        let interval = setInterval(() => {
            if (inputField.value.length < 10) {
                inputField.value += "BONZIBUDDY"[inputField.value.length];
            } else {
                clearInterval(interval);
                setTimeout(() => closeWindow("app4"), 1000);
                setTimeout(() => body.classList.remove("glitch-effect"), 1500);
            }
        }, 100);
        
    }, 1000);

    bonziTestFinished = true; // A mettre sur le serveur
    
}


function reloadIdentityCard() {
    let iframe = document.querySelector("#app6 iframe");
    if (iframe) {
        iframe.src = "/idendite"; // Recharge l'iframe avec les nouvelles données
    }
}



// Glitch de fond
function backgroundGlitch() {
    let glitchIndex = 0;
    let maxLoops = 7;
    let duration = 200;

    function changeBackground() {
        let glitch2 = document.getElementById("glitch2");
        glitch2.play()

        if (glitchIndex < maxLoops) {
            document.body.style.backgroundImage = `url("/static/img/glitch${glitchIndex}.jpg")`;
            glitchIndex++;
            setTimeout(changeBackground, duration); // Attend 1 seconde avant de passer à l'image suivante
        }
        else {
            document.body.style.backgroundImage = "url('/static/img/wallpaper.jpg')";
            glitch2.pause();
            duration += 200;
        }
    }

    changeBackground();
}

setInterval(() => {
    if (progress>=5 && Math.random() < 0.02) {
    backgroundGlitch();
    }
}, 1000);



// Barre de progression

function startProgressBar() {
    if (isProgressing) return;
    isProgressing = true;
    let progress = 0;
    let progressBarContainer = document.getElementById('progress-bar-container');
    let progressBar = document.getElementById('progress-bar');

    progressBarContainer.style.display = 'block';     
    ; 

    // Boucle pour mettre à jour la barre de progression
    let interval = setInterval(function() {
        if (progress >= 100) {
            clearInterval(interval);
            progressBarContainer.style.display = 'none'; 
            isProgressing = false;
        } else {
            progress += 1;
            progressBar.style.width = progress + '%';  
        }
    }, 500);

}



// Bonzi Game
function startGame() {
    let wContent = document.getElementById("window-content3");
    toggleFullScreen("app5");

    // Réinitialise l'état du jeu avant de l'ouvrir
    fetch('/reset-bonzi-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(() => {
        wContent.innerHTML = `<iframe src="jeu" style="width: 100%; height: 100%; border: none;"></iframe>`;
        
        function checkBonziGameStatus() {
            fetch('/get-bonzi-game-status')
            .then(response => response.json())
            .then(data => {
                if (data.bonzi_game_finished) {
                    bonziGameFinished = true;
                    closeWindow("app5");
                }
            })
            .catch(error => console.error("Erreur lors de la vérification du statut du jeu :", error));
        }
        
        setInterval(checkBonziGameStatus, 3000);
    })
    .catch(error => console.error("Erreur lors de la réinitialisation du jeu :", error));
}

function startingScreen() {
    let loadingScreen = document.getElementById("loading-screen");
    
    if (loadingScreen) {
        loadingScreen.style.display = "flex"; //Affiche l'écran de chargement avant d'attendre

        setTimeout(() => {
            loadingScreen.style.opacity = "0"; //Transition douce
            setTimeout(() => {
                loadingScreen.style.display = "none";
                loadingScreen.style.opacity = "1"; // Réinitialise l'opacité pour la prochaine fois
            }, 500);
        }, 5000); // Temps d'affichage
    }
}


document.addEventListener("DOMContentLoaded", () => startingScreen()  );

