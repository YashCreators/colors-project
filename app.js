// selectors
const colorsDiv = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
let initialcolors;

//eventlistners
sliders.forEach(slider =>{
    slider.addEventListener("input" , hslControls);
});
colorsDiv.forEach((div, index) =>{
    div.addEventListener("change" , () =>{
        updateUi(index);
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
        initialcolors.push(chroma((randomcolor).hex()));
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
                  e.target.getAttribute("data-brihgt")||
                  e.target.getAttribute("data-sat");

     let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
     const hue = sliders[0];
     const brightness = sliders[1];
     const saturation = sliders[2];

     const bgColor = initialcolors[index];
     
     let color = chroma(bgColor)
     .set("hsl.h", hue.value)
     .set("hsl.l", brightness.value)
     .set("hsl.s", saturation.value);

     colorsDiv[index].style.backgroundColor = color;
}

function updateUi(index){
    const activeDiv = colorsDiv[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();
    //check contrast
    checkTextContrast(color , textHex)

    for(icon of icons){
        checkTextContrast(color , icon);
    }
}



randomcolors();
