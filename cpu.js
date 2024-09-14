const INST_CLS = 0;
const INST_RET = 1;
const INST_JP_ADDR = 2;
const INST_CALL_ADDR = 3;
const INST_SE_VX_NN = 4;
const INST_SNE_VX_NN = 5;
const INST_SE_VX_VY = 6;
const INST_LD_VX_NN = 7;
const INST_ADD_VX_NN = 8;
const INST_LD_VX_VY = 9;
const INST_OR_VX_VY = 10;
const INST_AND_VX_VY = 11;
const INST_XOR_VX_VY = 12;
const INST_ADD_VX_VY = 13;
const INST_SUB_VX_VY = 14;
const INST_SHR_VX_VY = 15;
const INST_SUBN_VX_VY = 16;
const INST_SHL_VX_VY = 17;
const INST_SNE_VX_VY = 18;
const INST_LD_I_ADDR = 19;
const INST_JP_V0_ADDR = 20;
const INST_RND_VX_NN = 21;
const INST_DRW_VX_VY_N = 22;
const INST_SKP_VX = 23;
const INST_SKNP_VX = 24;
const INST_LD_VX_DT = 25;
const INST_LD_VX_N = 26;
const INST_LD_DT_VX = 27;
const INST_LD_ST_VX = 28;
const INST_ADD_I_VX = 29;
const INST_LD_F_VX = 30;
const INST_LD_B_VX = 31;
const INST_LD_I_VX = 32;
const INST_LD_VX_I = 33;


const STATE_HALT = 0;
const STATE_STEP = 1;
const STATE_RUN = 2;


class CPU
{
    constructor(display)
    {
        this.display = display;
        this.font = new Uint8Array([
            0xf0, 0x90, 0x90, 0x90, 0xf0,  // 0
            0x20, 0x60, 0x20, 0x20, 0x70,  // 1
            0xf0, 0x10, 0xf0, 0x80, 0xf0,  // 2
            0xf0, 0x10, 0xf0, 0x10, 0xf0,  // 3
            0x90, 0x90, 0xf0, 0x10, 0x10,  // 4
            0xf0, 0x80, 0xf0, 0x10, 0xf0,  // 5
            0xf0, 0x80, 0xf0, 0x90, 0xf0,  // 6
            0xf0, 0x10, 0x20, 0x40, 0x40,  // 7
            0xf0, 0x90, 0xf0, 0x90, 0xf0,  // 8
            0xf0, 0x90, 0xf0, 0x10, 0xf0,  // 9
            0xf0, 0x90, 0xf0, 0x90, 0x90,  // A
            0xe0, 0x90, 0xe0, 0x90, 0xe0,  // B
            0xf0, 0x80, 0x80, 0x80, 0xf0,  // C
            0xe0, 0x90, 0x90, 0x90, 0xe0,  // D
            0xf0, 0x80, 0xf0, 0x80, 0xf0,  // E
            0xf0, 0x80, 0xf0, 0x80, 0x80   // F
         ]);
        this.reset();
    }

    
    reset()
    {
        this.memory = new Uint8Array(1024 * 4);
        for(let i = 0; i < this.font.length; ++i)
            this.memory[i] = this.font[i];

        this.key = 0x0000;
        this.waitingForKey = false;

        this.PC = 0x200;
        this.V = new Uint8Array(16).fill(0);
        this.I = 0;
        this.SP = new Uint16Array;

        this.DT = 0;
        this.ST = 0;

        this.state = STATE_HALT;

        //this.display.reset();
    }


    fetch()
    {
        return this.memory[this.PC++];
    }


    decode(opcode)
    {
        this.X = (opcode & 0x0f00) >> 8;
        this.Y = (opcode & 0x00f0) >> 4;
        this.N = opcode & 0x000f;
        this.NN = opcode & 0x00ff;
        this.NNN = opcode & 0x0fff;
        
        switch(opcode & 0xf000)
        {
            case 0x0000:
                switch(opcode)
                {
                    case 0x00e0:  return new Array( INST_CLS, 'CLS' );
                    case 0x00ee:  return new Array( INST_RET, 'RET' );
                }
                break;

            case 0x1000:  return new Array( INST_JP_ADDR, 'JP $' + toHex(this.NNN, 3) );
            case 0x2000:  return new Array( INST_CALL_ADDR, 'CALL $' + toHex(this.NNN, 3) );
            case 0x3000:  return new Array( INST_SE_VX_NN, 'SE V' + toHex(this.X, 1) + ', $' + toHex(this.NN, 2) );
            case 0x4000:  return new Array( INST_SNE_VX_NN, 'SNE V' + toHex(this.X, 1) + ', $' + toHex(this.NN, 2) );
            case 0x5000:  return new Array( INST_SE_VX_VY, 'SE V' + toHex(this.X, 1) + ', V' + toHex(this.Y, 1) );;
            case 0x6000:  return new Array( INST_LD_VX_NN, 'LD V' + toHex(this.X, 1) + ', $' + toHex(this.NN, 2) );
            case 0x7000:  return new Array( INST_ADD_VX_NN, 'ADD V' + toHex(this.X, 1) + ', $' + toHex(this.NN, 2) );

            case 0x8000:
                switch(opcode & 0xf00f)
                {
                    case 0x8000:  return new Array( INST_LD_VX_VY, 'LD V' + toHex(this.X, 1) + ', V' + toHex(this.Y, 1) );
                    case 0x8001:  return new Array( INST_OR_VX_VY, 'OR V' + toHex(this.X, 1) + ', V' + toHex(this.Y, 1) );
                    case 0x8002:  return new Array( INST_AND_VX_VY, 'AND V' + toHex(this.X, 1) + ', V' + toHex(this.Y, 1) );
                    case 0x8003:  return new Array( INST_XOR_VX_VY, 'XOR V' + toHex(this.X, 1) + ', V' + toHex(this.Y, 1) );
                    case 0x8004:  return new Array( INST_ADD_VX_VY, 'ADD V' + toHex(this.X, 1) + ', V' + toHex(this.Y, 1) );
                    case 0x8005:  return new Array( INST_SUB_VX_VY, 'SUB V' + toHex(this.X, 1) + ', V' + toHex(this.Y, 1) );
                    case 0x8006:  return new Array( INST_SHR_VX_VY, 'SHR V' + toHex(this.X, 1) );
                    case 0x8007:  return new Array( INST_SUBN_VX_VY, 'SUBN V' + toHex(this.X, 1) + ', V' + toHex(this.Y, 1) );
                    case 0x800e:  return new Array( INST_SHL_VX_VY, 'SHL V' + toHex(this.X, 1) );
                }
                break;

            case 0x9000:  return new Array( INST_SNE_VX_VY, 'SNE V' + toHex(this.X, 1) + ', V' + toHex(this.Y, 1) );
            case 0xa000:  return new Array( INST_LD_I_ADDR, 'LD I, $' + toHex(this.NNN, 3) );
            case 0xb000:  return new Array( INST_JP_V0_ADDR, 'JP V0, $' + toHex(this.NNN, 3) );
            case 0xc000:  return new Array( INST_RND_VX_NN, 'RND V' + toHex(this.X, 1) + ', $' + toHex(this.NN, 2) );
            case 0xd000:  return new Array( INST_DRW_VX_VY_N, 'DRW V' + toHex(this.X, 1) + ', V' + toHex(this.Y, 1) + ', $' + toHex(this.N, 1) );

            case 0xe000:
                switch(opcode & 0xf0ff)
                {
                    case 0xe09e:  return new Array( INST_SKP_VX, 'SKP V' + toHex(this.X, 1) );
                    case 0xe0a1:  return new Array( INST_SKNP_VX, 'SKNP V' + toHex(this.X, 1) );
                }

            case 0xf000:
                switch(opcode & 0xf0ff)
                {
                    case 0xf007:  return new Array( INST_LD_VX_DT, 'LD V' + toHex(this.X, 1) + ', DT' );
                    case 0xf00a:  return new Array( INST_LD_VX_N, 'LD V' + toHex(this.X, 1) + ', K' );
                    case 0xf015:  return new Array( INST_LD_DT_VX, 'LD DT, V' + toHex(this.X, 1) );
                    case 0xf018:  return new Array( INST_LD_ST_VX, 'LD ST, V' + toHex(this.X, 1) );
                    case 0xf01e:  return new Array( INST_ADD_I_VX, 'ADD I, V' + toHex(this.X, 1) );
                    case 0xf029:  return new Array( INST_LD_F_VX, 'LD F, V' + toHex(this.X, 1) );
                    case 0xf033:  return new Array( INST_LD_B_VX, 'LD B, V' + toHex(this.X, 1) );
                    case 0xf055:  return new Array( INST_LD_I_VX, 'LD [I], V' + toHex(this.X, 1) );
                    case 0xf065:  return new Array( INST_LD_VX_I, 'LD V' + toHex(this.X, 1) + ', [I]' );
                }
                break;
        }

        
        return new Array( -1, '???' );
    }


    execute(inst)
    {
        switch(inst)
        {
            case INST_CLS:
                this.display.reset();
                break;
            
            case INST_RET:
                this.PC = this.SP[this.SP.length - 1];
                this.SP = this.SP.slice(0, -1);
                break;

            case INST_JP_ADDR:
                this.PC = this.NNN;
                break;

            case INST_CALL_ADDR:
                this.SP = new Uint16Array([...this.SP, this.PC]);
                this.PC = this.NNN;
                break;
            
            case INST_SE_VX_NN:
                if(this.V[this.X] == this.NN)
                    this.PC += 2;
                break;
            
            case INST_SNE_VX_NN:
                if(this.V[this.X] != this.NN)
                    this.PC += 2;
                break;
            
            case INST_SE_VX_VY:
                if(this.V[this.X] == this.V[this.Y])
                    this.PC += 2;
                break;
                    
            case INST_LD_VX_NN:
                this.V[this.X] = this.NN;
                break;
            
            case INST_ADD_VX_NN:
                this.V[this.X] += this.NN;
                break;

            case INST_LD_VX_VY:
                this.V[this.X] = this.V[this.Y];
                break;
            
            case INST_OR_VX_VY:
                this.V[this.X] |= this.V[this.Y];
                this.V[0xf] = 0;
                break;
            
            case INST_AND_VX_VY:
                this.V[this.X] &= this.V[this.Y];
                this.V[0xf] = 0;
                break;
            
            case INST_XOR_VX_VY:
                this.V[this.X] ^= this.V[this.Y];
                this.V[0xf] = 0;
                break;
            
            case INST_ADD_VX_VY:
            {
                let carry = this.V[this.X] + this.V[this.Y] > 0xff ? 1 : 0;
                this.V[this.X] += this.V[this.Y];
                this.V[0xf] = carry;
                break;
            }
            
            case INST_SUB_VX_VY:
            {
                let carry = this.V[this.X] >= this.V[this.Y] ? 1 : 0;
                this.V[this.X] -= this.V[this.Y];
                this.V[0xf] = carry;
                break;
            }
            
            case INST_SHR_VX_VY:
            {
                let carry = this.V[this.X] & 0x1;
                this.V[this.X] >>= 1;
                this.V[0xf] = carry;
                break;
            }
            
            case INST_SUBN_VX_VY:
            {
                let carry = this.V[this.Y] >= this.V[this.X] ? 1 : 0;
                this.V[this.X] = this.V[this.Y] - this.V[this.X];
                this.V[0xf] = carry;
                break;
            }
            
            case INST_SHL_VX_VY:
            {
                let carry = (this.V[this.X] >> 7) & 0x1;
                this.V[this.X] <<= 1;
                this.V[0xf] = carry;
                break;
            }
            
            case INST_SNE_VX_VY:
                if(this.V[this.X] != this.V[this.Y])
                    this.PC += 2;
                break;
            
            case INST_LD_I_ADDR:
                this.I = this.NNN;
                break;

            case INST_JP_V0_ADDR:
                this.PC = this.V[0] + this.NNN;
                break;

            case INST_RND_VX_NN:
                this.V[this.X] = Math.floor(Math.random() * 255) & this.NN;
                break;
            
            case INST_DRW_VX_VY_N:
                this.V[0xf] = 0;

                for(let j = 0; j < this.N; ++j)
                {
                    for(let i = 0; i < 8; ++i)
                    {
                        let pixel = this.display.getPixel(this.V[this.X] + i, this.V[this.Y] + j);
                        let newPixel = pixel ^ ((this.memory[this.I + j] >> (7 - i)) & 0x1);

                        if(pixel  &&  !newPixel)
                            this.V[0xf] = 1;
                        
                        if(newPixel)
                            this.display.setPixel(this.V[this.X] + i, this.V[this.Y] + j);
                        else
                            this.display.clearPixel(this.V[this.X] + i, this.V[this.Y] + j);
                    }
                }
                break;

            case INST_SKP_VX:
                if((this.key & (1 << this.V[this.X])) != 0)
                    this.PC += 2;
                break;
                
            case INST_SKNP_VX:
                if((this.key & (1 << this.V[this.X])) == 0)
                    this.PC += 2;
                break;

            case INST_LD_VX_DT:
                this.V[this.X] = this.DT;
                break;

            case INST_LD_VX_N:
                this.waitingForKey = true;
                break;

            case INST_LD_DT_VX:
                this.DT = this.V[this.X];
                break;
    
            case INST_LD_ST_VX:
                this.ST = this.V[this.X];

                if(this.ST)
                    this.soundOn();
                break;

            case INST_ADD_I_VX:
                this.I += this.V[this.X];
                break;

            case INST_LD_F_VX:
                this.I = this.V[this.X] * 5;
                break;

            case INST_LD_B_VX:
                this.memory[this.I] = Math.floor(this.V[this.X] / 100) % 10;
                this.memory[this.I + 1] = Math.floor(this.V[this.X] / 10) % 10;
                this.memory[this.I + 2] = this.V[this.X] % 10;
                break;

            case INST_LD_I_VX:
                for(let i = 0; i <= this.X; ++i)
                {
                    this.memory[this.I + i] = this.V[i];
                }
                break;

            case INST_LD_VX_I:
                for(let i = 0; i <= this.X; ++i)
                {
                    this.V[i] = this.memory[this.I + i];
                }
                break;

            default:
                console.log("unimplemented instruction: " + inst);
                this.state = STATE_HALT;
                break;        
        }
        
        this.cycles -= 2;
    }


    step()
    {
        var opcode = (this.fetch() << 8) | this.fetch();
        var inst = this.decode(opcode);
        
        if(inst[0] < 0)
        {
            console.log("unknown opcode: " + opcode.toString(16));
            this.state = STATE_HALT;
        }
        else if(this.PC >= 0x1000)
            this.state = STATE_HALT;
        else
            this.execute(inst[0]);
        
//        console.log("PC = " + this.PC.toString(16) + ", I = " + this.I.toString(16) + ", opcode = " + opcode.toString(16));
    }
    

    update()
    {
        if(this.DT)
            --this.DT;

        if(this.ST)
        {
            --this.ST;

            if(this.ST <= 0)
                this.soundOff();
        }

        this.cycles = 10;

        while(this.state != STATE_HALT  &&  !this.waitingForKey  &&  this.cycles > 0)
        {
            this.step();

            if(this.state == STATE_STEP)
                this.state = STATE_HALT;
        }
    }


    load(bytes)
    {
        this.reset();

        for(let i = 0; i < bytes.length; ++i)
            this.memory[0x200 + i] = bytes[i];

        this.state = STATE_HALT;

        
        this.audioContext = new (window.AudioContext  ||  window.webkitAudioContext)();

        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.15;  // 0 to 1
        this.masterGain.connect(this.audioContext.destination);
    }


    keyPressed(key)
    {
        let code = -1;

        switch(key)
        {
            case '1':  code = 0x1;  break;
            case '2':  code = 0x2;  break;
            case '3':  code = 0x3;  break;
            case '4':  code = 0xc;  break;
            case 'q':  code = 0x4;  break;
            case 'w':  code = 0x5;  break;
            case 'e':  code = 0x6;  break;
            case 'r':  code = 0xd;  break;
            case 'a':  code = 0x7;  break;
            case 's':  code = 0x8;  break;
            case 'd':  code = 0x9;  break;
            case 'f':  code = 0xe;  break;
            case 'z':  code = 0xa;  break;
            case 'x':  code = 0x0;  break;
            case 'c':  code = 0xb;  break;
            case 'v':  code = 0xf;  break;
        }

        if(code >= 0)
            this.key |= (1 << code);
    }


    keyReleased(key)
    {
        let code = -1;

        switch(key)
        {
            case '1':  code = 0x1;  break;
            case '2':  code = 0x2;  break;
            case '3':  code = 0x3;  break;
            case '4':  code = 0xc;  break;
            case 'q':  code = 0x4;  break;
            case 'w':  code = 0x5;  break;
            case 'e':  code = 0x6;  break;
            case 'r':  code = 0xd;  break;
            case 'a':  code = 0x7;  break;
            case 's':  code = 0x8;  break;
            case 'd':  code = 0x9;  break;
            case 'f':  code = 0xe;  break;
            case 'z':  code = 0xa;  break;
            case 'x':  code = 0x0;  break;
            case 'c':  code = 0xb;  break;
            case 'v':  code = 0xf;  break;
        }

        if(code >= 0)
        {
            this.key &= ~(1 << code);

            if(this.waitingForKey)
            {
                this.V[this.X] = code;
                this.waitingForKey = false;
            }
        }
    }

    soundOn()
    {
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.frequency.value = 440;
        this.oscillator.type = 'square';

        this.oscillator.connect(this.masterGain);

        this.oscillator.start();
    }

    soundOff()
    {
        this.oscillator.stop();
    }
}
