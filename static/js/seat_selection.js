const coach = document.getElementById("coach")
const selectedSeatsDisplay = document.getElementById("selectedSeats")
const selectedSeatsInput = document.getElementById("selectedSeatsInput")
const continueBtn = document.getElementById("continueBtn")

let selectedSeats = []

/* GET COACH TYPE */

const params = new URLSearchParams(window.location.search)
const coachType = params.get("coach")

/* ENSURE BOOKED SEATS ARE NUMBERS */

const bookedSeatsList = (typeof bookedSeats !== "undefined")
    ? bookedSeats.map(Number)
    : []


/* BERTH TYPE */

function berthType(seat){

    if(coachType === "2A"){

        const pos = (seat - 1) % 6 + 1

        if(pos === 1 || pos === 3) return "lower"
        if(pos === 2 || pos === 4) return "upper"
        if(pos === 5) return "sideLower"
        if(pos === 6) return "sideUpper"

    }

    else{

        const pos = (seat - 1) % 8 + 1

        if(pos === 1 || pos === 4) return "lower"
        if(pos === 2 || pos === 5) return "middle"
        if(pos === 3 || pos === 6) return "upper"
        if(pos === 7) return "sideLower"
        if(pos === 8) return "sideUpper"

    }

}


/* BERTH COLOR */

function berthColor(type){

    if(type === "lower") return "bg-green-500"
    if(type === "middle") return "bg-orange-500"
    if(type === "upper") return "bg-blue-500"
    if(type === "sideLower") return "bg-pink-500"
    if(type === "sideUpper") return "bg-purple-500"

}


/* CREATE SEAT */

function createSeat(seatNumber){

    const type = berthType(seatNumber)

    const seat = document.createElement("div")

    seat.innerText = seatNumber

    /* BOOKED SEAT */

    if(bookedSeatsList.includes(seatNumber)){

        seat.className =
        "w-12 h-12 flex items-center justify-center rounded bg-gray-400 text-white cursor-not-allowed"

        return seat
    }

    /* AVAILABLE SEAT */

    seat.className =
    `seat w-12 h-12 flex items-center justify-center text-white rounded cursor-pointer
    ${berthColor(type)} border-2 border-green-500`

    seat.addEventListener("click", () => toggleSeat(seatNumber, seat))

    return seat

}


/* TOGGLE SEAT */

function toggleSeat(seatNumber, element){

    if(selectedSeats.includes(seatNumber)){

        selectedSeats = selectedSeats.filter(s => s !== seatNumber)
        element.classList.remove("ring-4","ring-blue-500")

    }
    else{

        selectedSeats.push(seatNumber)
        element.classList.add("ring-4","ring-blue-500")

    }

    updateSelectedSeats()

}


/* UPDATE SELECTED SEATS */

function updateSelectedSeats(){

    if(selectedSeats.length === 0){

        selectedSeatsDisplay.innerText = "None"
        continueBtn.disabled = true

    }
    else{

        selectedSeatsDisplay.innerText = selectedSeats.join(", ")
        continueBtn.disabled = false

    }

    selectedSeatsInput.value = selectedSeats.join(",")

}


/* BUILD SLEEPER / 3A */

function buildSleeperLayout(totalSeats){

    for(let i = 1; i <= totalSeats; i += 8){

        const compartment = document.createElement("div")

        compartment.className =
        "bg-white rounded-lg shadow p-4 grid grid-cols-[repeat(3,auto)_60px_auto] gap-3 items-center"


        /* TOP BERTHS */

        for(let j = 0; j < 3; j++){
            if(i+j <= totalSeats)
                compartment.appendChild(createSeat(i + j))
        }


        /* AISLE */

        const gap = document.createElement("div")
        gap.className = "w-6"
        compartment.appendChild(gap)


        /* SIDE LOWER */

        if(i+6 <= totalSeats)
            compartment.appendChild(createSeat(i + 6))


        /* BOTTOM BERTHS */

        for(let j = 3; j < 6; j++){
            if(i+j <= totalSeats)
                compartment.appendChild(createSeat(i + j))
        }


        /* AISLE */

        const gap2 = document.createElement("div")
        gap2.className = "w-6"
        compartment.appendChild(gap2)


        /* SIDE UPPER */

        if(i+7 <= totalSeats)
            compartment.appendChild(createSeat(i + 7))


        coach.appendChild(compartment)

    }

}


/* BUILD 2A */

function build2TierLayout(){

    const totalSeats = 48

    for(let i = 1; i <= totalSeats; i += 6){

        const compartment = document.createElement("div")

        compartment.className =
        "bg-white rounded-lg shadow p-4 grid grid-cols-[repeat(2,auto)_60px_auto] gap-4 items-center"


        compartment.appendChild(createSeat(i))
        compartment.appendChild(createSeat(i+1))


        const gap = document.createElement("div")
        gap.className = "w-6"
        compartment.appendChild(gap)


        compartment.appendChild(createSeat(i+4))


        compartment.appendChild(createSeat(i+2))
        compartment.appendChild(createSeat(i+3))


        const gap2 = document.createElement("div")
        gap2.className = "w-6"
        compartment.appendChild(gap2)


        compartment.appendChild(createSeat(i+5))


        coach.appendChild(compartment)

    }

}


/* BUILD CHAIR CAR */

function buildChairCarLayout(){

    let seatNumber = 1
    const totalSeats = 78

    while(seatNumber <= totalSeats){

        const rowDiv = document.createElement("div")

        rowDiv.className =
        "bg-white rounded-lg shadow p-4 grid grid-cols-[repeat(3,auto)_60px_repeat(2,auto)] gap-3 items-center"


        for(let i=0;i<3;i++){
            if(seatNumber <= totalSeats)
                rowDiv.appendChild(createSeat(seatNumber++))
        }


        const gap = document.createElement("div")
        gap.className = "w-6"
        rowDiv.appendChild(gap)


        for(let i=0;i<2;i++){
            if(seatNumber <= totalSeats)
                rowDiv.appendChild(createSeat(seatNumber++))
        }


        coach.appendChild(rowDiv)

    }

}


/* BUILD COACH */

function buildCoach(){

    if(coachType === "SL"){
        buildSleeperLayout(72)
    }

    else if(coachType === "3A"){
        buildSleeperLayout(64)
    }

    else if(coachType === "2A"){
        build2TierLayout()
    }

    else if(coachType === "CC"){
        buildChairCarLayout()
    }

    else{
        buildSleeperLayout(72)
    }

}


buildCoach()