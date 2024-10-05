// constants

const DISPLAY_PIXELWIDTH = 64;
const DISPLAY_PIXELHEIGHT = 32;

const DISPLAY_WIDTH = DISPLAY_PIXELWIDTH * 10;
const DISPLAY_HEIGHT = DISPLAY_PIXELHEIGHT * 10;

const DISPLAY_FREQ = 60;
const DISPLAY_TIMEOUT = 1000 / DISPLAY_FREQ;


class Display
{
    constructor(canvas)
    {
        this.canvas = canvas;
        this.canvasContext = canvas.getContext('2d');
        this.reset();
    }


    reset()
    {
        this.pixels = new Uint8Array(DISPLAY_PIXELWIDTH * DISPLAY_PIXELHEIGHT);
    }


    getPixel(x, y)
    {
        return this.pixels[y * DISPLAY_PIXELWIDTH + x];
    }


    setPixel(x, y)
    {
        this.pixels[y * DISPLAY_PIXELWIDTH + x] = 1;
    }


    clearPixel(x, y)
    {
        this.pixels[y * DISPLAY_PIXELWIDTH + x] = 0;
    }


    update()
    {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        this.canvasContext.fillStyle = localStorage.getItem("canvas-color");
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for(let j = 0; j < DISPLAY_PIXELHEIGHT; ++j)
        {
            for(let i = 0; i < DISPLAY_PIXELWIDTH; ++i)
            {
                this.canvasContext.fillStyle = localStorage.getItem("text-color");
                
                if(this.getPixel(i, j))
                    this.canvasContext.fillRect(i * 10, j * 10, 9, 9);
            }
        }
    
    }
}
