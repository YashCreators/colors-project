// selectors
const colorsDiv = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popUp = document.querySelector('.copy-container');

const adjustButton = document.querySelectorAll('.adjust');
const lockButton = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
let initialcolors;
//this is for local storage
let savePalettes = [];

//eventlistners

//generate random colors
generateBtn.addEventListener('click' , randomcolors);

sliders.forEach(slider => {
    slider.addEventListener("input" , hslControls);
});

colorsDiv.forEach((div, index) =>{
    div.addEventListener("change" , () =>{
        updateUi(index);
    });
});

currentHexes.forEach(hex =>{
    hex.addEventListener('click', ()=>{
        copyToClipBoard(hex);
    });
});

popUp.addEventListener('transitionend' , ()=> {
    const popUpBox = popUp.children[0];
    popUp.classList.remove("active");
    popUpBox.classList.remove("active");
});

adjustButton.forEach((button,index) =>{
    button.addEventListener('click', () => {
        openAdjustmentPanel(index);
    });
});
closeAdjustments.forEach((button,index) =>{
    button.addEventListener('click', () =>{
        closeAdjustmentpanel(index);
    });
});


//fuctions

//colors generator
function generateHex() {
    const hexColor = chroma.random();
    return hexColor;
}

function randomcolors() {
    initialcolors = [];

    colorsDiv.forEach((div,index) => {    
        const hextext = div.children[0];
        const randomcolor = generateHex();
        
        //locking lock-open item
        if (div.classList === "lockButton") {
            initialcolors.push(hextext.innerText);
            return;
        } 
        else{
            initialcolors.push(chroma(randomcolor).hex());
        }

        //add color to bg
        div.style.backgroundColor = randomcolor;
        hextext.innerText = randomcolor;

        // check contrast
        checkTextContrast(randomcolor , hextext);

        //initially colored sliders

    const color = chroma(randomcolor);
    const sliders = div.querySelectorAll('.sliders input');
    const hue = sliders[0];
    const saturation = sliders[1];
    const brightness = sliders[2];
        
    colorizeSliders(color , hue , saturation , brightness);
    });

    //to reset all slider inputs
    resetInput();

    // check for button contrast
    adjustButton.forEach((button,index) =>{
        checkTextContrast(initialcolors[index] , button);
        checkTextContrast(initialcolors[index] , lockButton[index]);
    });
}
function checkTextContrast(color,text){
    const luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = "black";
    }
    else{
        text.style.color = "white";
    }
}

function colorizeSliders(color , hue , brightness , saturation){
    //scale saturation
    const noSat = color.set('hsl.s' , 0);
    const fullSat = color.set('hsl.s' , 1);
    const scaleSat = chroma.scale([noSat , color , fullSat]);
    //scale brightness
    const midBright = color.set("hsl.l" , 0.5);
    const scaleBright = chroma.scale(["black" , midBright , "white"]);
    
    //update input slider
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)} , ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)} , ${scaleBright(0.5)} , ${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,204) )`;
}

function hslControls(e){
    const index = e.target.getAttribute("data-hue")||
                  e.target.getAttribute("data-bright")||
                  e.target.getAttribute("data-sat");

     let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
     const hue = sliders[0];
     const brightness = sliders[1];
     const saturation = sliders[2];
//this is bg
     const bgColor = initialcolors[index];
     
     let color = chroma(bgColor)
     .set("hsl.h", hue.value)
     .set("hsl.l", brightness.value)
     .set("hsl.s", saturation.value);

     colorsDiv[index].style.backgroundColor = color;

     //colorize sliders
     colorizeSliders(color , hue , brightness , saturation);
}

function updateUi(index){
    const activeDiv = colorsDiv[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();
    //check contrast
    checkTextContrast(color , textHex);

    for(icon of icons){
        checkTextContrast(color , icon);
    }
}
function resetInput(){
    const sliders = document.querySelectorAll(".sliders input");
    sliders.forEach(slider => {
        if (slider.name === "hue"){
            const hueColor = initialcolors[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if (slider.name === "brightness"){
            const brightColor = initialcolors[slider.getAttribute("data-bright")];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100) / 100;
        }
        if (slider.name === "saturation"){
            const satColor = initialcolors[slider.getAttribute("data-sat")];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;
        }
    });
}

function copyToClipBoard(hex){
    const element = document.createElement('textarea');
    element.value = hex.innerText;
    document.body.appendChild(element);
    element.select();
    document.execCommand('copy');
    document.body.removeChild(element);

    //for popup animation
    const popUpBox = popUp.children[0];
    popUp.classList.add('active');
    popUpBox.classList.add('active'); 
}

function openAdjustmentPanel(index){
    sliderContainers[index].classList.toggle('active');
}
function closeAdjustmentpanel(index){
    sliderContainers[index].classList.remove('active');
}

function lockLayer(e , index){
    const lockSVG = e.target.children[0];
    const activeBg = colorsDiv[index];

    if (lockSVG.classList.contains('fa-lock-open')){
        e.target.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
        e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
}

//implement save to palette and local storage 
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');

randomcolors();
