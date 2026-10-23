const form = document.querySelector("#daret-form")

const nomCercle = document.querySelector("#nom-cercle")
const cotisation = document.querySelector("#cotisation")
const periodicite = document.querySelector("#periodicite")
const dateDebut = document.querySelector("#date-debut")
const liste = document.querySelector("#participants-liste")
const boutonAjouter = document.querySelector("#ajouter-participant")
const compteur = document.querySelector("#participants-compteur")
const erreur = document.querySelector("#participants-erreur")

const minimum = Number(liste.dataset.min)
const maximum = Number(liste.dataset.max)

const fatals = [
    {
        input: nomCercle,
        err: document.querySelector("#nom-cercle-erreur")
    },
    {
        input: cotisation,
        err: document.querySelector("#cotisation-erreur")
    },
    {
        input: periodicite,
        err: document.querySelector("#periodicite-erreur")
    },
    {
        input: dateDebut,
        err: document.querySelector("#date-debut-erreur")
    }
]
function showerr(input, err, mssg) {
    err.textContent = mssg
    err.classList.remove("hidden")
    input.ariaInvalid = "true"
    input.setAttribute("aria-describedby", err.id)
}

function deleterr(input, err) {
    err.textContent = ""
    err.classList.add("hidden")
    input.ariaInvalid = "false"
    input.removeAttribute("aria-describedby")
}
function validname() {
    const name = nomCercle.value.trim()
    const regex = /^(?=.*[\p{L}\p{M}])[\p{L}\p{M}0-9 -]{3,40}$/u

    if (!regex.test(name)) {
        showerr(nomCercle, fatals[0].err, "Le nom doit contenir 3 à 40 caractères et au moins une lettre.")
        return false
    }

    deleterr(nomCercle, fatals[0].err)
    return true
}
function valideCotisation(){
    const money = Number(cotisation.value)
    if(money < 100 || money > 50000 || !Number.isInteger(money)){
        showerr(cotisation, fatals[1].err, "Montant entre 100 et 50 000 MAD.")
        return false
    }
    deleterr(cotisation, fatals[1].err)
    return true
}
function validePeriodicite(){
    if(periodicite.value != "hebdomadaire" && periodicite.value != "quinzaine" && periodicite.value != "mensuelle"){
        showerr(periodicite, fatals[2].err, "Choisissez une périodicité.")
        return false
    }
    deleterr(periodicite, fatals[2].err)
    return true
}
function validdate(){
    let today = new Date()
    today.setHours(0,0,0,0)

    let datechoise = new Date(dateDebut.value + "T00:00:00")

    if(dateDebut.value === "" || datechoise < today){
        showerr(dateDebut, fatals[3].err, "Choisissez aujourd'hui ou une date future.")
        return false
    }
    deleterr(dateDebut, fatals[3].err)
    return true
}
function valideform(){
    const namevalid = validname()
    const datevalid = validdate()
    const periovalid = validePeriodicite()
    const cotisationvalid = valideCotisation()

    return namevalid && datevalid && periovalid && cotisationvalid
}
nomCercle.addEventListener("input", validname)
periodicite.addEventListener("input", validePeriodicite)
cotisation.addEventListener("change", valideCotisation)
dateDebut.addEventListener("change", validdate)

form.addEventListener("submit", function(event){
    event.preventDefault()
    if(valideform() === false){
        const firstfatal = document.querySelector('[aria-invalid="true"]')
        if(firstfatal){
            firstfatal.focus()
        }
        return
    }
    console.log("Configuration valide !")
})



function mettreAJourCompteur() {
    const nombre = liste.querySelectorAll("li").length

    compteur.textContent = nombre + " participants"

    boutonAjouter.disabled = nombre >= maximum

    const boutonsSupprimer = liste.querySelectorAll(".retirer")

    boutonsSupprimer.forEach(function(bouton) {
        bouton.disabled = nombre <= minimum
    })
}

function ajouterParticipant() {
    const nombre = liste.querySelectorAll("li").length

    if (nombre >= maximum) {
        erreur.textContent = "Maximum 20 participants."
        erreur.classList.remove("hidden")
        return
    }

    erreur.textContent = ""
    erreur.classList.add("hidden")

    const ligne = document.createElement("li")
    ligne.classList.add("flex", "items-center", "gap-2")

    const input = document.createElement("input")
    input.type = "text"
    input.name = "participants"
    input.placeholder = "Prénom du participant"
    input.classList.add(
        "min-w-0",
        "flex-1",
        "rounded",
        "border",
        "border-daret-bordure",
        "px-3",
        "py-2"
    )

    const boutonSupprimer = document.createElement("button")
    boutonSupprimer.type = "button"
    boutonSupprimer.textContent = "Retirer"
    boutonSupprimer.classList.add(
        "retirer",
        "rounded",
        "border",
        "px-3",
        "py-2"
    )

    ligne.append(input, boutonSupprimer)
    liste.append(ligne)

    mettreAJourCompteur()
    input.focus()
}

boutonAjouter.addEventListener("click", ajouterParticipant)

liste.addEventListener("click", function(event) {
    const bouton = event.target.closest(".retirer")

    if (!bouton) {
        return
    }

    const nombre = liste.querySelectorAll("li").length

    if (nombre <= minimum) {
        erreur.textContent = "Il faut garder au moins 2 participants."
        erreur.classList.remove("hidden")
        return
    }

    bouton.closest("li").remove()

    erreur.textContent = ""
    erreur.classList.add("hidden")

    mettreAJourCompteur()
})

ajouterParticipant()
ajouterParticipant()
ajouterParticipant()

function calculerMontantRecu(cotisation, nombreParticipants) {
    return cotisation * nombreParticipants
}

function calculerTotalParticipant(cotisation, nombreTours) {
    return cotisation * nombreTours
}

function calculerNombreTours(nombreParticipants) {
    return nombreParticipants
}

function calculerDatePremierTour(dateDebut) {
    return new Date(dateDebut)
}

function calculerDateDernierTour(dateDebut, periodicite, nombreTours) {
    const date = new Date(dateDebut)

    for (let i = 1 ;i < nombreTours; i++) {
        if (periodicite === "hebdomadaire") {
            date.setDate(date.getDate() + 7)
        } else if (periodicite === "quinzaine") {
            date.setDate(date.getDate() + 14)
        } else if (periodicite === "mensuelle") {
            date.setMonth(date.getMonth() + 1)
        }
    }

    return date
}

function calculerDateTour(dateDebut, periodicite, numeroTour) {
    const date = new Date(dateDebut);
    const jourInitial = date.getDate();

    for (let i = 0; i < numeroTour; i++) {
        if (periodicite === "hebdomadaire") {
            date.setDate(date.getDate() + 7);
        } else if (periodicite === "quinzaine") {
            date.setDate(date.getDate() + 14);
        } else if (periodicite === "mensuelle") {
            date.setDate(1);
            date.setMonth(date.getMonth() + 1);

            const dernierJour = new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                0
            ).getDate();

            date.setDate(Math.min(jourInitial, dernierJour));
        }
    }

    return date;
}

function formaterDate(date) {
    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function genererCalendrier(
    participants,
    cotisation,
    dateDebut,
    periodicite
) {
    const conteneur = document.querySelector("#calendrier");
    conteneur.replaceChildren();

    const tableau = document.createElement("table");
    const thead = document.createElement("thead");
    const ligneEntete = document.createElement("tr");

    const colonnes = [
        "N°",
        "Date du tour",
        "Bénéficiaire",
        "Montant reçu",
        "Statut"
    ];

    colonnes.forEach(function (colonne) {
        const th = document.createElement("th");
        th.textContent = colonne;
        ligneEntete.append(th);
    });

    thead.append(ligneEntete);

    const tbody = document.createElement("tbody");

    participants.forEach(function (participant, index) {
        const ligne = document.createElement("tr");

        const dateTour = calculerDateTour(
            dateDebut,
            periodicite,
            index
        );

        const valeurs = [
            index + 1,
            formaterDate(dateTour),
            participant,
            (cotisation * participants.length).toLocaleString("fr-FR") + " MAD",
            "À venir"
        ];

        valeurs.forEach(function (valeur) {
            const td = document.createElement("td");
            td.textContent = valeur;
            ligne.append(td);
        });

        tbody.append(ligne);
    });

    tableau.append(thead, tbody);
    conteneur.append(tableau);
}
