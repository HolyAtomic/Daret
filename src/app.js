<<<<<<< HEAD
=======

const form = document.querySelector("#daret-form")

const nomCercle = document.querySelector("#nom-cercle")
const cotisation = document.querySelector("#cotisation")
const periodicite = document.querySelector("#periodicite")
const dateDebut = document.querySelector("#date-debut")

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
];
function deleterr(err, input){
    err.textContent = ""
    err.classList.add("hidden")
    input.ariaInvalid = "false"
}
function showerr(input, err, mssg){
    err.textContent = mssg
    err.classList.remove("hidden")
    input.ariaInvalid = "true"
}
function validname(){
    const name = nomCercle.value.trim()
    const regex = /^[\p{L}\p{M}0-9 -]{3,40}$/u
    
    if (!regex.test(name)){
        showerr(name, fatals[0].err, "Nom invalide (3 à 40 caractères).")
        return false
    }
    deleterr(name, fatals[0].err)
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
            firstfatal.focus();
        }
        return
    }
    console.log("Configuration valide !");
})
 
>>>>>>> US1
