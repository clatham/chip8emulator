// global variables

const g_canvas = document.getElementById('canvas1');
const g_canvasContext = g_canvas.getContext('2d');

var g_nextTime;

var g_display = new Display(g_canvas);
var g_cpu = new CPU(g_display);

let onNewRun = false;

document.getElementById("mode").children[0].className = localStorage.getItem("theme") === "light" ? "bi bi-moon-stars" : "bi bi-lightning";

localStorage.getItem("canvas-color") ? null : localStorage.setItem("canvas-color", "#00008b");
localStorage.getItem("text-color") ? null : localStorage.setItem("text-color", "#fff");

localStorage.getItem("theme") ? null : localStorage.setItem("theme", "light");

document.getElementById("canvas-color").value = localStorage.getItem("canvas-color");
document.getElementById("text-color").value = localStorage.getItem("text-color");

document.body.className = localStorage.getItem("theme");

function fillIcon(e, fillCondition) {
    const includesFill = e.children[0].className.includes("-fill");
    if (fillCondition && !includesFill) {
        e.children[0].className += "-fill";
    } else if (includesFill) {
        e.children[0].className = e.children[0].className.slice(0, -5);
    }
}

function changeMode(e) {
    e.children[0].classList.toggle("bi-moon-stars-fill");
    e.children[0].classList.toggle("bi-lightning-fill");
    localStorage.setItem("theme", localStorage.getItem("theme") === "light" ? "dark" : "light");
    document.body.className = localStorage.getItem("theme");
}

function toggleColor() {
    document.getElementById("colorpickerdiv").classList.toggle("hidden");
}

function updateCanvas() {
    localStorage.setItem("canvas-color", document.getElementById("canvas-color").value);
    localStorage.setItem("text-color", document.getElementById("text-color").value);
    g_display.update();
}

// init variables for the main loop

function setup()
{
    g_canvas.width = DISPLAY_WIDTH;
    g_canvas.height = DISPLAY_HEIGHT;

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.querySelector('#load').addEventListener('change', onLoad);
    document.querySelector('#halt').addEventListener('click', onHalt);
    document.querySelector('#run').addEventListener('click', onRun);
    document.querySelector('#step').addEventListener('click', onStep);
    
    g_nextTime = Date.now();
    loop();
}


// main loop that waits for the next update interval to elapse

function loop()
{
    var now = Date.now();

    if(now >= g_nextTime)
    {
        g_nextTime += DISPLAY_TIMEOUT;

        g_cpu.update();
        g_display.update();

        document.querySelector('#registers1').textContent =
            "PC:" + toHex(g_cpu.PC, 4) +
            "  I:" + toHex(g_cpu.I, 3) +
            "  DT:" + toHex(g_cpu.DT, 2) +
            "  ST:" + toHex(g_cpu.ST, 2) +
            "  key:" + toHex(g_cpu.key, 4);
        document.querySelector('#registers2').textContent =
            "V0:" + toHex(g_cpu.V[0], 2) +
            "  V1:" + toHex(g_cpu.V[1], 2) +
            "  V2:" + toHex(g_cpu.V[2], 2) +
            "  V3:" + toHex(g_cpu.V[3], 2) +
            "  V4:" + toHex(g_cpu.V[4], 2) +
            "  V5:" + toHex(g_cpu.V[5], 2) +
            "  V6:" + toHex(g_cpu.V[6], 2) +
            "  V7:" + toHex(g_cpu.V[7], 2);
        document.querySelector('#registers3').textContent =
            "V8:" + toHex(g_cpu.V[8], 2) +
            "  V9:" + toHex(g_cpu.V[9], 2) +
            "  VA:" + toHex(g_cpu.V[0xa], 2) +
            "  VB:" + toHex(g_cpu.V[0xb], 2) +
            "  VC:" + toHex(g_cpu.V[0xc], 2) +
            "  VD:" + toHex(g_cpu.V[0xd], 2) +
            "  VE:" + toHex(g_cpu.V[0xe], 2) +
            "  VF:" + toHex(g_cpu.V[0xf], 2);
        
        for(let i = 0; i < 16; ++i)
        {
            let opcode = (g_cpu.memory[g_cpu.PC + i * 2] << 8) | g_cpu.memory[g_cpu.PC + i * 2 + 1];

            document.querySelector('#memory' + i).textContent =
                toHex(g_cpu.PC + i * 2, 4) + ":  " +
                toHex(opcode, 4) + "  " +
                g_cpu.decode(opcode)[1];
        }
        
        for(let i = 0; i < 16; ++i)
        {
            document.querySelector('#stack' + i).textContent = i < g_cpu.SP.length ?
                "SP(" + toHex(i, 1) + "):  " + toHex(g_cpu.SP[i], 4) : "";
        }
    }

    
    // schedule loop() to get called again
    requestAnimationFrame(loop);
}


//

function onKeyDown(e)
{
    g_cpu.keyPressed(e.key);
}


//

function onKeyUp(e)
{
    g_cpu.keyReleased(e.key);
}


// load the selected file into memory

function onLoad()
{
    var file = document.querySelector("#load").files[0];

    var reader = new FileReader();

    reader.onload = function(e) {
        var arrayBuffer = e.target.result;
        var bytes = new Uint8Array(arrayBuffer);

        g_cpu.load(bytes);
    };

    reader.onerror = function(e) {
        console.log('error: ' + e.type);
    };
    
    reader.readAsArrayBuffer(file);

    onNewRun = true;
}


function onHalt()
{
    g_cpu.state = STATE_HALT;
}


function onRun()
{
    onNewRun ? g_display.reset() : null;
    onNewRun = false;
    g_cpu.state = STATE_RUN;
}


function onStep()
{
    onNewRun ? g_display.reset() : null;
    onNewRun = false;
    g_cpu.state = STATE_STEP;
}


function toHex(num, width)
{
    num = num.toString(16);

    while(num.length < width)
        num = "0" + num;

    return num.toUpperCase();
}


setup();
