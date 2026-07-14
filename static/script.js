/* ==========================================================
   EcoTrace Pro
   JavaScript
   Part 1
========================================================== */


// ============================================
// DOM Elements
// ============================================

const calculateBtn = document.getElementById("calculateBtn");

const resetBtn = document.getElementById("resetBtn");

const downloadBtn = document.getElementById("downloadBtn");

const topBtn = document.getElementById("topBtn");

const loader = document.getElementById("loader");

const toast = document.getElementById("toast");

const toastMessage = document.getElementById("toastMessage");

const scrollBtn = document.getElementById("scrollBtn");


// ============================================
// Input Elements
// ============================================

const nameInput = document.getElementById("name");

const travelInput = document.getElementById("travel");

const electricityInput = document.getElementById("electricity");

const foodInput = document.getElementById("food");

const wasteInput = document.getElementById("waste");


// ============================================
// Dashboard
// ============================================

const carbonValue = document.getElementById("carbonValue");

const rating = document.getElementById("rating");

const progressBar = document.getElementById("progressBar");

const scoreText = document.getElementById("scoreText");

const tipsContainer = document.getElementById("tipsContainer");

const historyTable = document.getElementById("historyTable");


// ============================================
// Loader
// ============================================

window.addEventListener("load", () => {

    setTimeout(() => {

        loader.style.opacity = "0";

        loader.style.visibility = "hidden";

    }, 1800);

});


// ============================================
// Smooth Scroll
// ============================================

scrollBtn.addEventListener("click", () => {

    document
        .getElementById("calculator")
        .scrollIntoView({

            behavior: "smooth"

        });

});


// ============================================
// Toast
// ============================================

function showToast(message) {

    toastMessage.innerHTML = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


// ============================================
// Reset Form
// ============================================

resetBtn.addEventListener("click", () => {

    nameInput.value = "";

    travelInput.value = "";

    electricityInput.value = "";

    wasteInput.value = "";

    foodInput.selectedIndex = 0;

    carbonValue.innerHTML = "0";

    rating.innerHTML = "Waiting...";

    progressBar.style.width = "0%";

    scoreText.innerHTML = "0%";

    tipsContainer.innerHTML = `
        <div class="tip-card">

            <i class="fa-solid fa-seedling"></i>

            <p>

                Calculate your footprint to receive AI recommendations.

            </p>

        </div>
    `;

    showToast("Form Reset Successfully");

});


// ============================================
// Animated Counters
// ============================================

function counter(id, target) {

    let value = 0;

    const speed = target / 100;

    const element = document.getElementById(id);

    const interval = setInterval(() => {

        value += speed;

        if (value >= target) {

            value = target;

            clearInterval(interval);

        }

        element.innerHTML = Math.floor(value);

    }, 20);

}


counter("usersCounter", 1524);

counter("treesCounter", 783);

counter("carbonCounter", 19845);


// ============================================
// Calculate Button
// ============================================

calculateBtn.addEventListener("click", calculateCarbon);


// ============================================
// Calculate Carbon
// ============================================

async function calculateCarbon() {

    if (nameInput.value.trim() === "") {

        showToast("Please enter your name.");

        return;

    }

    const data = {

        name: nameInput.value,

        travel: Number(travelInput.value),

        electricity: Number(electricityInput.value),

        food: Number(foodInput.value),

        waste: Number(wasteInput.value)

    };

    try {

        const response = await fetch("/calculate", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(data)

        });

        const result = await response.json();

        updateDashboard(result);

        loadHistory();

        showToast("Carbon Footprint Calculated Successfully");

    }

    catch (error) {

        console.log(error);

        showToast("Server Error");

    }

}


// ============================================
// Update Dashboard
// ============================================

function updateDashboard(result) {

    carbonValue.innerHTML = result.carbon;

    rating.innerHTML = result.rating;

    let score = 100 - (result.carbon / 15);

    if (score < 0) score = 0;

    if (score > 100) score = 100;

    progressBar.style.width = score + "%";

    scoreText.innerHTML = Math.round(score) + "%";

    loadTips(result.tips);

    createCharts(result.carbon);

}

/* ==========================================================
   EcoTrace Pro
   JavaScript
   Part 2
========================================================== */


// ============================================
// Chart Variables
// ============================================

let carbonChart = null;

let comparisonChart = null;


// ============================================
// Create Charts
// ============================================

function createCharts(carbon){

    if(carbonChart){

        carbonChart.destroy();

    }

    if(comparisonChart){

        comparisonChart.destroy();

    }


    const ctx1 = document
        .getElementById("carbonChart")
        .getContext("2d");


    carbonChart = new Chart(ctx1,{

        type:"doughnut",

        data:{

            labels:[
                "Carbon Emission",
                "Remaining"
            ],

            datasets:[{

                data:[
                    carbon,
                    Math.max(1500-carbon,0)
                ],

                backgroundColor:[
                    "#2ecc71",
                    "#3d3d3d"
                ],

                borderWidth:0

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{

                    labels:{

                        color:"white"

                    }

                }

            }

        }

    });



    const ctx2=document
        .getElementById("comparisonChart")
        .getContext("2d");



    comparisonChart=new Chart(ctx2,{

        type:"bar",

        data:{

            labels:[

                "You",

                "Average",

                "Ideal"

            ],

            datasets:[{

                label:"kg CO₂",

                data:[

                    carbon,

                    700,

                    250

                ],

                backgroundColor:[

                    "#2ecc71",

                    "#f1c40f",

                    "#3498db"

                ]

            }]

        },

        options:{

            responsive:true,

            scales:{

                y:{

                    beginAtZero:true,

                    ticks:{

                        color:"white"

                    },

                    grid:{

                        color:"rgba(255,255,255,.08)"

                    }

                },

                x:{

                    ticks:{

                        color:"white"

                    },

                    grid:{

                        color:"rgba(255,255,255,.08)"

                    }

                }

            },

            plugins:{

                legend:{

                    labels:{

                        color:"white"

                    }

                }

            }

        }

    });

}



// ============================================
// AI Tips
// ============================================

function loadTips(tips){

    tipsContainer.innerHTML="";

    tips.forEach(tip=>{

        tipsContainer.innerHTML += `

        <div class="tip-card">

            <i class="fa-solid fa-leaf"></i>

            <p>${tip}</p>

        </div>

        `;

    });

}



// ============================================
// Load History
// ============================================

async function loadHistory(){

    try{

        const response=await fetch("/history");

        const history=await response.json();

        historyTable.innerHTML="";

        if(history.length===0){

            historyTable.innerHTML=`

            <tr>

                <td colspan="4">

                    No Records Found

                </td>

            </tr>

            `;

            return;

        }

        history.forEach(item=>{

            historyTable.innerHTML += `

            <tr>

                <td>${item.name}</td>

                <td>${item.carbon} kg</td>

                <td>${item.rating}</td>

                <td>${item.date}</td>

            </tr>

            `;

        });

    }

    catch(error){

        console.log(error);

    }

}



// ============================================
// Initial History
// ============================================

loadHistory();



// ============================================
// Back To Top Button
// ============================================

window.addEventListener("scroll",()=>{

    if(window.scrollY>300){

        topBtn.style.display="block";

    }

    else{

        topBtn.style.display="none";

    }

});



topBtn.addEventListener("click",()=>{

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});



// ============================================
// Download Report
// ============================================

downloadBtn.addEventListener("click",()=>{

    const report=`

====================================

        EcoTrace Pro Report

====================================

Name : ${nameInput.value}

Travel : ${travelInput.value} KM

Electricity : ${electricityInput.value} kWh

Food Score : ${foodInput.value}

Waste : ${wasteInput.value} KG

------------------------------------

Carbon Emission :

${carbonValue.innerHTML} kg CO₂

Rating :

${rating.innerHTML}

Generated On :

${new Date().toLocaleString()}

====================================

`;

    const blob=new Blob(

        [report],

        {

            type:"text/plain"

        }

    );

    const link=document.createElement("a");

    link.href=URL.createObjectURL(blob);

    link.download="EcoTrace_Report.txt";

    link.click();

    showToast("Report Downloaded");

});



// ============================================
// Enter Key Support
// ============================================

document.addEventListener("keydown",(event)=>{

    if(event.key==="Enter"){

        calculateCarbon();

    }

});


/* ==========================================================
   EcoTrace Pro
   JavaScript
   Part 3 (FINAL)
========================================================== */


// ============================================
// Input Validation
// ============================================

const numericInputs = [

    travelInput,

    electricityInput,

    wasteInput

];

numericInputs.forEach(input => {

    input.addEventListener("input", () => {

        if (Number(input.value) < 0) {

            input.value = 0;

        }

    });

});


// ============================================
// Rating Colors
// ============================================

function updateRatingColor(text) {

    const value = text.toLowerCase();

    if (value.includes("excellent")) {

        rating.style.color = "#2ecc71";

    }

    else if (value.includes("good")) {

        rating.style.color = "#7bed9f";

    }

    else if (value.includes("moderate")) {

        rating.style.color = "#f1c40f";

    }

    else {

        rating.style.color = "#ff4d4d";

    }

}


// ============================================
// Animate Carbon Value
// ============================================

function animateCarbon(target) {

    let current = 0;

    const step = target / 80;

    const timer = setInterval(() => {

        current += step;

        if (current >= target) {

            current = target;

            clearInterval(timer);

        }

        carbonValue.innerHTML = current.toFixed(1);

    }, 15);

}


// ============================================
// Override Dashboard Update
// ============================================

const oldDashboard = updateDashboard;

updateDashboard = function(result){

    oldDashboard(result);

    animateCarbon(result.carbon);

    updateRatingColor(result.rating);

};



// ============================================
// Auto Refresh History
// ============================================

setInterval(()=>{

    loadHistory();

},30000);



// ============================================
// Auto Focus
// ============================================

window.addEventListener("load",()=>{

    nameInput.focus();

});



// ============================================
// Prevent Empty Numbers
// ============================================

function emptyToZero(input){

    if(input.value===""){

        input.value=0;

    }

}

travelInput.addEventListener("blur",()=>{

    emptyToZero(travelInput);

});

electricityInput.addEventListener("blur",()=>{

    emptyToZero(electricityInput);

});

wasteInput.addEventListener("blur",()=>{

    emptyToZero(wasteInput);

});



// ============================================
// Keyboard Shortcut
// ============================================

document.addEventListener("keydown",(event)=>{

    if(event.ctrlKey && event.key==="r"){

        event.preventDefault();

        resetBtn.click();

    }

});



// ============================================
// Footer Year
// ============================================

const year = new Date().getFullYear();

const copyright = document.querySelector(".copyright");

if(copyright){

    copyright.innerHTML = `

        © ${year} EcoTrace Pro

        <br>

        Designed with ❤️ for a Sustainable Planet

    `;

}



// ============================================
// Welcome Message
// ============================================

setTimeout(()=>{

    showToast("🌿 Welcome to EcoTrace Pro");

},2000);



// ============================================
// Console Message
// ============================================

console.log("======================================");

console.log(" EcoTrace Pro Loaded Successfully ");

console.log(" Flask + JavaScript + Machine Learning ");

console.log("======================================");



// ============================================
// End of File
// ===========================================