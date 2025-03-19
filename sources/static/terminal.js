let currentDirectory = null;
let pathHistory = [];

const inputField = document.getElementById("input");
const outputDiv = document.getElementById("output");
const promptSpan = document.getElementById("prompt");

function printToTerminal(text, isCommand = false) {
    outputDiv.innerHTML += isCommand ? `<b>${text}</b><br>` : `${text}<br>`;

    setTimeout(() => {
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }, 10);
}
let isDeleting = false;

// Fonction pour simuler la suppression de Bonzi
function simulateDeletion() {
    if (isDeleting) {
        let progress = 0;
        let interval = setInterval(() => {
            if (progress < 562) {
                progress++;
                printToTerminal(`Suppression de Bonzi en cours [${progress}/562]`);
            } else {
                clearInterval(interval);
                finishDeletion();
            }
        }, 50); // Intervalles de 50 ms pour faire durer la suppression en 30 secondes
    }
}

function finishDeletion() {
    printToTerminal("Suppression terminée.");

    // Rediriger vers la page "/credit"
    window.top.location.href = "/credit";
}

async function selectDirectory() {
    let input = document.getElementById("directory-picker");

    input.onchange = function (event) {
        let files = event.target.files;

        if (files.length > 0) {
            currentDirectory = {
                name: files[0].webkitRelativePath.split("/")[0], // Nom du dossier parent
                files: {},
                subdirs: {}
            };

            // Parcours tous les fichiers sélectionnés
            for (let file of files) {
                let pathParts = file.webkitRelativePath.split("/");
                let filename = pathParts.pop(); // Récupère le nom du fichier
                let folder = currentDirectory;

                // 🔥 Crée une structure de dossiers internes si nécessaire
                for (let part of pathParts) {
                    if (!folder.subdirs[part]) {
                        folder.subdirs[part] = { name: part, files: {}, subdirs: {} };
                    }
                    folder = folder.subdirs[part];
                }

                // Stocke le fichier dans le bon dossier
                folder.files[filename] = file;
            }

            pathHistory = [currentDirectory]; // Met à jour l'historique
            updatePrompt();
            printToTerminal(`Dossier sélectionné: <b>${currentDirectory.name}</b>`);
        } else {
            printToTerminal("Accès au dossier annulé.");
        }
    };

    input.click(); // ✅ Ouvre la boîte de dialogue
}

function listFiles() {
    if (!currentDirectory) {
        printToTerminal("Sélectionne d'abord un dossier avec <b>select</b>");
        return;
    }

    let fileList = Object.keys(currentDirectory.files).map(f => `[F] ${f}`);
    let dirList = Object.keys(currentDirectory.subdirs).map(d => `[D] ${d}`);

    let output = fileList.concat(dirList).join("<br>") || "(Dossier vide)";
    printToTerminal(`Contenu de <b>${currentDirectory.name}</b>:<br>${output}`);

}

function changeDirectory(folderName) {
    if (!currentDirectory) {
        printToTerminal("Sélectionne d'abord un dossier avec <b>select</b>");
        return;
    }

    if (!currentDirectory.subdirs[folderName]) {
        printToTerminal(`Le dossier <b>${folderName}</b> n'existe pas.`);
        return;
    }

    currentDirectory = currentDirectory.subdirs[folderName];
    pathHistory.push(currentDirectory);
    updatePrompt();
    printToTerminal(`Changement de dossier: <b>${folderName}</b>`);
}


function goBack() {
    if (pathHistory.length > 1) {
        pathHistory.pop();
        currentDirectory = pathHistory[pathHistory.length - 1];
        updatePrompt();
        printToTerminal("Retour au dossier précédent.");
    } else {
        printToTerminal("Déjà au niveau racine.");
    }
}

async function openFile(filename) {
    if (!currentDirectory) {
        printToTerminal("Sélectionne d'abord un dossier avec <b>select</b>");
        return;
    }

    if (!currentDirectory.files[filename]) {
        printToTerminal(`Impossible d'ouvrir <b>${filename}</b>. Vérifie son existence.`);
        return;
    }

    let file = currentDirectory.files[filename];

    if (file.name === "delete_bonzi.bat") {
        const userConfirmation = confirm("Êtes-vous sûr de vouloir supprimer Bonzi ? Cette action sera irréversible.");
        if (userConfirmation) {
            printToTerminal("Suppression de Bonzi lancée...");
            isDeleting = true;
            simulateDeletion();
        } else {
            printToTerminal("Suppression annulée.");
        }
    }

    else if (file.type.startsWith("image/")) {
        let imageUrl = URL.createObjectURL(file);
        printToTerminal(`<br> <img src="${imageUrl}" alt="${filename}" width="300px">`);
    } else {
        let content = await file.text();
        printToTerminal(`Contenu de <b>${filename}</b>:<br>---<br>${content.split("\n").slice(0, 10).join("<br>")}<br>---`);
    }
}

function showHelp() {
    const helpText = `
    <b>Liste des commandes disponibles :</b><br>
    <b>select</b> - Choisir un dossier<br>
    <b>ls</b> - Lister les fichiers et dossiers<br>
    <b>cd [nom_dossier]</b> - Entrer dans un dossier<br>
    <b>retour</b> - Revenir au dossier précédent<br>
    <b>open [nom_fichier]</b> - Ouvrir un fichier (texte ou image)<br>
    <b>help</b> - Afficher cette aide
    `;
    printToTerminal(helpText);
}

function executeCommand(command) {
    if (command.trim() === "") return;

    const parts = command.split(" ");
    const cmd = parts[0].toLowerCase();

    if (cmd === "select") {
        selectDirectory();
    } else if (cmd === "ls") {
        listFiles();
    } else if (cmd === "cd" && parts.length > 1) {
        changeDirectory(parts[1]);
    } else if (cmd === "open" && parts.length > 1) {
        openFile(parts[1]);
    } else if (cmd === "retour") {
        goBack();
    } else if (cmd === "help") {
        showHelp();
    } else {
        printToTerminal("Commande inconnue. Tapez <b>help</b> pour voir la liste.");
    }
}

function updatePrompt() {
    let location = currentDirectory ? currentDirectory.name : "~ (Sélectionne un dossier)";
    promptSpan.textContent = `Terminal: ${location}$ `;
    inputField.value = "";
}

inputField.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const command = this.value.trim();
        printToTerminal(`Terminal: ${currentDirectory ? currentDirectory.name : "~"}$ ${command}`, true);
        executeCommand(command);
        updatePrompt();
    }
});

updatePrompt();