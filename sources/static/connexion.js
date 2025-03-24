isBonziTalking = false;
audioFinished = false;


function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");
    
    // Identifiant et mot de passe prédéfinis
    const validUsername = "2004soft4.1joejay";
    const validPassword = "71515518"; 
    
    if (username === validUsername && password === validPassword) {
        window.location.href = "BonzIw0rld" ; // Redirection après connexion réussie
    } else {
        errorMessage.textContent = "Identifiant ou mot de passe incorrect.";
    }
}

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
        bonzi.src = "/static/anim_bonzi/bonzi_baille.gif";
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