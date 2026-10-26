function calculerMontantRecu(cotisation, nombreParticipants) {
    return cotisation * nombreParticipants
}

function calculerTotalParticipant(cotisation, nombreTours) {
    return cotisation * nombreTours
}

function calculerNombreTours(nombreParticipants) {
    return nombreParticipants
}

function calculerDateTour(dateDebut, periodicite, numeroTour) {
    const jourInitial = dateDebut.getDate()

    if (periodicite === "hebdomadaire") {
        return new Date(dateDebut.getFullYear(), dateDebut.getMonth(), jourInitial + 7 * numeroTour)
    }
    if (periodicite === "quinzaine") {
        return new Date(dateDebut.getFullYear(), dateDebut.getMonth(), jourInitial + 14 * numeroTour)
    }

    const annee = dateDebut.getFullYear()
    const mois = dateDebut.getMonth() + numeroTour
    const dernierJour = new Date(annee, mois + 1, 0).getDate()
    return new Date(annee, mois, Math.min(jourInitial, dernierJour))
}

function calculerDatePremierTour(dateDebut) {
    return new Date(dateDebut.getTime())
}

function calculerDateDernierTour(dateDebut, periodicite, nombreTours) {
    return calculerDateTour(dateDebut, periodicite, nombreTours - 1)
}

function formaterDate(date) {
    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    })
}

function formaterMontant(montant) {
    return montant.toLocaleString("fr-FR") + " MAD"
}

function parserDateLocale(valeur) {
    return new Date(valeur + "T00:00:00")
}

function melangerOrdre(participants) {
    const resultat = [...participants]

    for (let i = resultat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resultat[i], resultat[j]] = [resultat[j], resultat[i]]
    }

    return resultat
}

function libelleTours(nombreTermines, total) {
    const pluriel = nombreTermines > 1 ? "s" : ""
    return `${nombreTermines} tour${pluriel} terminé${pluriel} sur ${total}`
}

const form = document.querySelector("#daret-form")

const nomCercle = document.querySelector("#nom-cercle")
const cotisation = document.querySelector("#cotisation")
const periodicite = document.querySelector("#periodicite")
const dateDebut = document.querySelector("#date-debut")
const liste = document.querySelector("#participants-liste")
const boutonAjouter = document.querySelector("#ajouter-participant")
const compteur = document.querySelector("#participants-compteur")
const erreur = document.querySelector("#participants-erreur")

const boutonReinit = document.querySelector("#reinitialiser")
const etatVide = document.querySelector("#etat-vide")
const resultats = document.querySelector("#contenu-resultat")
const titreResultat = document.querySelector("#titre-resultat")
const resumeCagnotte = document.querySelector("#resume-cagnotte")
const resumeTotalCycle = document.querySelector("#resume-total-cycle")
const resumeNbTours = document.querySelector("#resume-nb-tours")
const resumeDates = document.querySelector("#resume-dates")
const conteneurCalendrier = document.querySelector("#calendrier")
const corpsCalendrier = document.querySelector("#calendrier-corps")
const compteurTours = document.querySelector("#compteur-tours")
const boutonTirage = document.querySelector("#tirage-au-sort")
const boutonOrdreSaisie = document.querySelector("#ordre-saisie")

const minimum = Number(liste.dataset.min) || 2
const maximum = Number(liste.dataset.max) || 20

compteurTours?.setAttribute("aria-live", "polite")

const champs = {
    nom: { input: nomCercle, err: document.querySelector("#nom-cercle-erreur") },
    cotisation: { input: cotisation, err: document.querySelector("#cotisation-erreur") },
    periodicite: { input: periodicite, err: document.querySelector("#periodicite-erreur") },
    date: { input: dateDebut, err: document.querySelector("#date-debut-erreur") }
}

const CLASSES_TERMINE = ["ligne-terminee"]
const CLASSES_PROCHAIN = ["prochain-tour"]

let cercle = null
let compteurId = 0

function showerr(input, err, message) {
    err.textContent = message
    err.classList.remove("hidden")
    input.setAttribute("aria-invalid", "true")
    input.setAttribute("aria-describedby", err.id)
}

function deleterr(input, err) {
    err.textContent = ""
    err.classList.add("hidden")
    input.setAttribute("aria-invalid", "false")
    input.removeAttribute("aria-describedby")
}

function afficher(element, visible) {
    if (element) {
        element.classList.toggle("hidden", !visible)
    }
}

function validname() {
    const name = nomCercle.value.trim()
    const { input, err } = champs.nom

    if (name.length < 3 || name.length > 40) {
        showerr(input, err, "Le nom doit contenir entre 3 et 40 caractères.")
        return false
    }
    if (!/^[\p{L}\p{M}0-9 -]+$/u.test(name)) {
        showerr(input, err, "Seuls les lettres, chiffres, espaces et tirets sont autorisés.")
        return false
    }

    deleterr(input, err)
    return true
}

function valideCotisation() {
    const { input, err } = champs.cotisation
    const brut = cotisation.value.trim()
    const money = Number(brut)

    if (brut === "") {
        showerr(input, err, "Saisissez un montant.")
        return false
    }
    if (!Number.isInteger(money)) {
        showerr(input, err, "Le montant doit être un nombre entier.")
        return false
    }
    if (money < 100 || money > 50000) {
        showerr(input, err, "Montant entre 100 et 50 000 MAD.")
        return false
    }

    deleterr(input, err)
    return true
}

function validePeriodicite() {
    const { input, err } = champs.periodicite

    if (!["hebdomadaire", "quinzaine", "mensuelle"].includes(periodicite.value)) {
        showerr(input, err, "Choisissez une périodicité.")
        return false
    }

    deleterr(input, err)
    return true
}

function validdate() {
    const { input, err } = champs.date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dateDebut.value === "") {
        showerr(input, err, "Choisissez une date de début.")
        return false
    }
    if (parserDateLocale(dateDebut.value) < today) {
        showerr(input, err, "Choisissez aujourd'hui ou une date future.")
        return false
    }

    deleterr(input, err)
    return true
}

function lignesParticipants() {
    return Array.from(liste.querySelectorAll("li"))
}

function inputsParticipants() {
    return Array.from(liste.querySelectorAll('input[name="participants"]'))
}

function normaliser(prenom) {
    return prenom.trim().toLocaleLowerCase("fr")
}

function validerParticipant(input) {
    const err = input.closest("li").querySelector("[data-erreur-participant]")
    const prenom = input.value.trim()

    let message = ""

    if (prenom === "") {
        message = "Le prénom est obligatoire."
    } else if (!/^[\p{L}\p{M}'’-]+$/u.test(prenom)) {
        message = "Lettres, apostrophe et tiret uniquement."
    } else if (prenom.length < 2 || prenom.length > 30) {
        message = "Le prénom doit contenir entre 2 et 30 lettres."
    } else {
        const tous = inputsParticipants()
        const position = tous.indexOf(input)
        const doublon = tous.slice(0, position).some(function (autre) {
            return normaliser(autre.value) === normaliser(prenom)
        })
        if (doublon) {
            message = "Ce prénom est déjà utilisé."
        }
    }

    if (message) {
        showerr(input, err, message)
        return false
    }

    deleterr(input, err)
    return true
}

function validerParticipants() {
    const resultatsChamps = inputsParticipants().map(validerParticipant)
    return resultatsChamps.every(Boolean)
}

function valideform() {
    const namevalid = validname()
    const cotisationvalid = valideCotisation()
    const periovalid = validePeriodicite()
    const datevalid = validdate()
    const participantsvalid = validerParticipants()

    return namevalid && cotisationvalid && periovalid && datevalid && participantsvalid
}

nomCercle.addEventListener("input", validname)
cotisation.addEventListener("input", valideCotisation)
periodicite.addEventListener("input", validePeriodicite)
dateDebut.addEventListener("input", validdate)
dateDebut.addEventListener("change", validdate)

liste.addEventListener("input", function (event) {
    const input = event.target.closest('input[name="participants"]')

    if (!input) {
        return
    }

    validerParticipant(input)

    inputsParticipants().forEach(function (autre) {
        if (autre !== input && autre.getAttribute("aria-invalid") === "true") {
            validerParticipant(autre)
        }
    })
})

function mettreAJourCompteur() {
    const nombre = lignesParticipants().length

    compteur.textContent = nombre + " participants"

    boutonAjouter.disabled = nombre >= maximum

    liste.querySelectorAll(".retirer").forEach(function (bouton) {
        bouton.disabled = nombre <= minimum
    })
}

function ajouterParticipant(donnerFocus = true) {
    if (lignesParticipants().length >= maximum) {
        erreur.textContent = `Maximum ${maximum} participants.`
        erreur.classList.remove("hidden")
        return
    }

    erreur.textContent = ""
    erreur.classList.add("hidden")

    compteurId++

    const ligne = document.createElement("li")
    ligne.classList.add("flex", "flex-col", "gap-1")

    const rangee = document.createElement("div")
    rangee.classList.add("flex", "items-center", "gap-2")

    const input = document.createElement("input")
    input.type = "text"
    input.name = "participants"
    input.placeholder = "Prénom du participant"
    input.setAttribute("aria-label", "Prénom du participant")
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
    boutonSupprimer.classList.add("retirer", "rounded", "border", "px-3", "py-2")

    const err = document.createElement("p")
    err.id = "participant-erreur-" + compteurId
    err.setAttribute("data-erreur-participant", "")
    err.classList.add("hidden", "text-sm", "text-red-600")

    rangee.append(input, boutonSupprimer)
    ligne.append(rangee, err)
    liste.append(ligne)

    mettreAJourCompteur()

    if (donnerFocus) {
        input.focus()
    }
}

boutonAjouter.addEventListener("click", function () {
    ajouterParticipant()
})

liste.addEventListener("click", function (event) {
    const bouton = event.target.closest(".retirer")

    if (!bouton) {
        return
    }

    if (lignesParticipants().length <= minimum) {
        erreur.textContent = `Il faut garder au moins ${minimum} participants.`
        erreur.classList.remove("hidden")
        return
    }

    bouton.closest("li").remove()

    erreur.textContent = ""
    erreur.classList.add("hidden")

    mettreAJourCompteur()

    inputsParticipants().forEach(function (input) {
        if (input.getAttribute("aria-invalid") === "true") {
            validerParticipant(input)
        }
    })
})

function afficherResume(donnees) {
    const nombreParticipants = donnees.ordreSaisie.length
    const nombreTours = calculerNombreTours(nombreParticipants)
    const premier = calculerDatePremierTour(donnees.debut)
    const dernier = calculerDateDernierTour(donnees.debut, donnees.periodicite, nombreTours)

    resumeCagnotte.textContent = formaterMontant(calculerMontantRecu(donnees.cotisation, nombreParticipants))
    resumeTotalCycle.textContent = formaterMontant(calculerTotalParticipant(donnees.cotisation, nombreTours))
    resumeNbTours.textContent = String(nombreTours)
    resumeDates.textContent = formaterDate(premier) + " · " + formaterDate(dernier)
}

function genererCalendrier(donnees) {
    const montant = formaterMontant(calculerMontantRecu(donnees.cotisation, donnees.ordre.length))
    const lignes = []

    donnees.ordre.forEach(function (participant, index) {
        const ligne = document.createElement("tr")
        ligne.dataset.tour = index + 1

        const tdNumero = document.createElement("td")
        tdNumero.classList.add("px-4", "py-3")
        tdNumero.textContent = index + 1

        const tdDate = document.createElement("td")
        tdDate.classList.add("px-4", "py-3")
        tdDate.textContent = formaterDate(calculerDateTour(donnees.debut, donnees.periodicite, index))

        const tdBeneficiaire = document.createElement("td")
        tdBeneficiaire.classList.add("px-4", "py-3")
        const boutonDetail = document.createElement("button")
        boutonDetail.type = "button"
        boutonDetail.dataset.action = "ouvrir-detail"
        boutonDetail.classList.add("font-medium", "underline", "focus:outline-2", "focus:outline-offset-2", "focus:outline-daret-vert")
        boutonDetail.textContent = participant
        tdBeneficiaire.append(boutonDetail)

        const tdMontant = document.createElement("td")
        tdMontant.classList.add("px-4", "py-3")
        tdMontant.textContent = montant

        const tdStatut = document.createElement("td")
        tdStatut.classList.add("px-4", "py-3")
        const statut = document.createElement("span")
        statut.dataset.statut = ""
        tdStatut.append(statut)

        const tdAction = document.createElement("td")
        tdAction.classList.add("px-4", "py-3")
        const boutonStatut = document.createElement("button")
        boutonStatut.type = "button"
        boutonStatut.dataset.action = "basculer-statut"
        boutonStatut.classList.add("rounded", "border", "border-daret-bordure", "px-3", "py-1", "text-sm", "focus:outline-2", "focus:outline-offset-2", "focus:outline-daret-vert")
        tdAction.append(boutonStatut)

        ligne.append(tdNumero, tdDate, tdBeneficiaire, tdMontant, tdStatut, tdAction)
        lignes.push(ligne)
    })

    corpsCalendrier.replaceChildren(...lignes)

    mettreAJourAvancement()
}

function afficherOrdre() {
    corpsCalendrier.querySelectorAll("tr").forEach(function (ligne, index) {
        ligne.querySelector('[data-action="ouvrir-detail"]').textContent = cercle.ordre[index]
    })
}

boutonTirage?.addEventListener("click", function () {
    if (!cercle) {
        return
    }
    cercle.ordre = melangerOrdre(cercle.ordreSaisie)
    afficherOrdre()
})

boutonOrdreSaisie?.addEventListener("click", function () {
    if (!cercle) {
        return
    }
    cercle.ordre = [...cercle.ordreSaisie]
    afficherOrdre()
})

function mettreAJourAvancement() {
    if (!cercle || !corpsCalendrier) {
        if (compteurTours) compteurTours.textContent = ""
        return
    }

    let nombreTermines = 0
    let prochainTourTrouve = false

    corpsCalendrier.querySelectorAll("tr").forEach(function (ligne, index) {
        const bouton = ligne.querySelector('[data-action="basculer-statut"]')
        const statut = ligne.querySelector("[data-statut]")
        const termine = cercle.termines[index]

        if (termine) {
            nombreTermines++
            ligne.classList.add(...CLASSES_TERMINE)
            statut.textContent = "Terminé"
            bouton.textContent = "Annuler"
        } else {
            ligne.classList.remove(...CLASSES_TERMINE)
            statut.textContent = "À venir"
            bouton.textContent = "Marquer comme terminé"
        }

        if (!termine && !prochainTourTrouve) {
            ligne.classList.add(...CLASSES_PROCHAIN)
            prochainTourTrouve = true
        } else {
            ligne.classList.remove(...CLASSES_PROCHAIN)
        }
    })

    if (compteurTours) {
        compteurTours.textContent = libelleTours(nombreTermines, cercle.termines.length)
    }
}

const dialogue = document.querySelector("#detail-tour")
const detailTitre = document.querySelector("#detail-titre")
const detailDate = document.querySelector("#detail-date")
const detailBeneficiaire = document.querySelector("#detail-beneficiaire")
const detailMontant = document.querySelector("#detail-montant")
const detailContributeurs = document.querySelector("#detail-contributeurs")
const detailFermer = document.querySelector("#detail-fermer")

let elementOuvreur = null

function ouvrirDetail(index, ouvreur) {
    const date = calculerDateTour(cercle.debut, cercle.periodicite, index)
    const montant = calculerMontantRecu(cercle.cotisation, cercle.ordre.length)

    detailTitre.textContent = `Tour n° ${index + 1}`
    detailDate.textContent = formaterDate(date)
    detailBeneficiaire.textContent = cercle.ordre[index]
    detailMontant.textContent = formaterMontant(montant)

    const autres = []
    cercle.ordre.forEach(function (prenom, i) {
        if (i !== index) {
            const li = document.createElement("li")
            li.textContent = prenom
            autres.push(li)
        }
    })
    detailContributeurs.replaceChildren(...autres)

    elementOuvreur = ouvreur
    dialogue.showModal()
}

corpsCalendrier.addEventListener("click", function (event) {
    const boutonStatut = event.target.closest('[data-action="basculer-statut"]')

    if (boutonStatut) {
        const index = Number(boutonStatut.closest("tr").dataset.tour) - 1
        cercle.termines[index] = !cercle.termines[index]
        mettreAJourAvancement()
        return
    }

    const boutonDetail = event.target.closest('[data-action="ouvrir-detail"]')

    if (boutonDetail) {
        const index = Number(boutonDetail.closest("tr").dataset.tour) - 1
        ouvrirDetail(index, boutonDetail)
    }
})

detailFermer.addEventListener("click", function () {
    dialogue.close()
})

dialogue.addEventListener("click", function (event) {
    if (event.target === dialogue) {
        const zone = dialogue.getBoundingClientRect()
        const dedans =
            event.clientX >= zone.left && event.clientX <= zone.right &&
            event.clientY >= zone.top && event.clientY <= zone.bottom

        if (!dedans) {
            dialogue.close()
        }
    }
})

dialogue.addEventListener("close", function () {
    if (elementOuvreur && document.contains(elementOuvreur)) {
        elementOuvreur.focus()
    }
    elementOuvreur = null
})

form.addEventListener("submit", function (event) {
    event.preventDefault()

    if (!valideform()) {
        const premierEnErreur = form.querySelector('[aria-invalid="true"]')
        if (premierEnErreur) {
            premierEnErreur.focus()
        }
        return
    }

    const prenoms = inputsParticipants().map(function (input) {
        return input.value.trim()
    })

    cercle = {
        cotisation: Number(cotisation.value),
        periodicite: periodicite.value,
        debut: parserDateLocale(dateDebut.value),
        ordreSaisie: prenoms,
        ordre: [...prenoms],
        termines: prenoms.map(function () { return false })
    }

    afficherResume(cercle)
    genererCalendrier(cercle)

    afficher(etatVide, false)
    afficher(resultats, true)
    titreResultat?.focus()
})

boutonReinit?.addEventListener("click", function () {
    if (dialogue.open) {
        dialogue.close()
    }

    form.reset()

    Object.values(champs).forEach(function ({ input, err }) {
        deleterr(input, err)
    })

    erreur.textContent = ""
    erreur.classList.add("hidden")

    liste.replaceChildren()
    for (let i = 0; i < 3; i++) {
        ajouterParticipant(false)
    }

    cercle = null
    corpsCalendrier.replaceChildren()
    if (compteurTours) compteurTours.textContent = ""

    afficher(resultats, false)
    afficher(etatVide, true)

    nomCercle.focus()
})

for (let i = 0; i < 3; i++) {
    ajouterParticipant(false)
}