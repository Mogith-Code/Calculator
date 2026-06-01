/**
 * Scientific Calculator - Parser and Interface Controller
 * Created by Mogith Chandrakumar
 */

// DOM Elements
const screenFormula = document.querySelector('.screen_formula');
const screenMain = document.querySelector('.screen_main');
const screenAngle = document.querySelector('.screen_angle-mode');

const numBtns = document.querySelectorAll('.num');
const funcBtns = document.querySelectorAll('.func');
const constantBtns = document.querySelectorAll('.constant');
const parenBtns = document.querySelectorAll('.paren');
const operatorBtns = document.querySelectorAll('.operatorBtn');
const equalBtn = document.querySelector('.equalbtn');
const allClearBtn = document.querySelector('.allclear');
const deleteBtn = document.querySelector('.delete');
const percentBtn = document.querySelector('.percent');
const powerBtn = document.querySelector('.power');
const factorialBtn = document.querySelector('.factorial');
const angleToggleBtn = document.querySelector('.angle-toggle');
const ansBtn = document.querySelector('.ans-btn');

// State Variables
let currentInput = '';
let lastAnswer = 0;
let activeAngleMode = 'deg';
let resultDisplayed = false;

// Update visual display
function updateScreen() {
    if (currentInput === '') {
        screenMain.textContent = '0';
    } else {
        screenMain.textContent = currentInput;
    }
}

// Event Bindings

// 1. Number Buttons
numBtns.forEach(button => {
    button.addEventListener('click', () => {
        if (resultDisplayed) {
            currentInput = '';
            resultDisplayed = false;
        }
        const val = button.textContent;
        if (val === '00' && (currentInput === '' || currentInput === '0')) {
            currentInput = '0';
        } else if (val === '0' && currentInput === '0') {
            // Keep single leading zero
        } else {
            if (currentInput === '0' && val !== '.') {
                currentInput = val;
            } else {
                currentInput += val;
            }
        }
        updateScreen();
    });
});

// 2. Scientific Functions (sin, cos, tan, log, ln, √)
funcBtns.forEach(button => {
    button.addEventListener('click', () => {
        if (resultDisplayed) {
            currentInput = '';
            resultDisplayed = false;
        }
        const funcName = button.textContent.trim();
        currentInput += funcName + '(';
        updateScreen();
    });
});

// 3. Mathematical Constants (π, e)
constantBtns.forEach(button => {
    button.addEventListener('click', () => {
        if (resultDisplayed) {
            currentInput = '';
            resultDisplayed = false;
        }
        currentInput += button.textContent.trim();
        updateScreen();
    });
});

// 4. Parentheses
parenBtns.forEach(button => {
    button.addEventListener('click', () => {
        if (resultDisplayed) {
            currentInput = '';
            resultDisplayed = false;
        }
        currentInput += button.textContent.trim();
        updateScreen();
    });
});

// 5. Basic Operators (+, -, ×, ÷)
operatorBtns.forEach(button => {
    button.addEventListener('click', () => {
        resultDisplayed = false;
        const op = button.textContent.trim();
        if (currentInput === '' && op === '-') {
            currentInput = '-';
        } else if (currentInput !== '') {
            const lastThree = currentInput.slice(-3);
            if (lastThree === ' + ' || lastThree === ' - ' || lastThree === ' × ' || lastThree === ' ÷ ') {
                currentInput = currentInput.slice(0, -3) + ` ${op} `;
            } else {
                currentInput += ` ${op} `;
            }
        }
        updateScreen();
    });
});

// 6. Factorial (!)
if (factorialBtn) {
    factorialBtn.addEventListener('click', () => {
        resultDisplayed = false;
        currentInput += '!';
        updateScreen();
    });
}

// 7. Power (^)
if (powerBtn) {
    powerBtn.addEventListener('click', () => {
        resultDisplayed = false;
        currentInput += '^';
        updateScreen();
    });
}

// 8. Percent (%)
if (percentBtn) {
    percentBtn.addEventListener('click', () => {
        resultDisplayed = false;
        currentInput += '%';
        updateScreen();
    });
}

// 9. ANS (Last Answer)
if (ansBtn) {
    ansBtn.addEventListener('click', () => {
        if (resultDisplayed) {
            currentInput = '';
            resultDisplayed = false;
        }
        currentInput += 'ANS';
        updateScreen();
    });
}

// 10. AC (All Clear)
if (allClearBtn) {
    allClearBtn.addEventListener('click', () => {
        currentInput = '';
        screenFormula.textContent = '';
        resultDisplayed = false;
        updateScreen();
    });
}

// 11. Del (Backspace)
if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
        if (resultDisplayed) {
            screenFormula.textContent = '';
            resultDisplayed = false;
        }
        if (currentInput.endsWith(' + ') || currentInput.endsWith(' - ') || currentInput.endsWith(' × ') || currentInput.endsWith(' ÷ ')) {
            currentInput = currentInput.slice(0, -3);
        } else if (currentInput.endsWith('sin(') || currentInput.endsWith('cos(') || currentInput.endsWith('tan(') || currentInput.endsWith('log(')) {
            currentInput = currentInput.slice(0, -4);
        } else if (currentInput.endsWith('ln(')) {
            currentInput = currentInput.slice(0, -3);
        } else if (currentInput.endsWith('ANS')) {
            currentInput = currentInput.slice(0, -3);
        } else {
            currentInput = currentInput.slice(0, -1);
        }
        updateScreen();
    });
}

// 12. Deg/Rad Toggle
if (angleToggleBtn) {
    angleToggleBtn.addEventListener('click', () => {
        if (activeAngleMode === 'deg') {
            activeAngleMode = 'rad';
            angleToggleBtn.textContent = 'RAD';
            screenAngle.textContent = 'RAD';
        } else {
            activeAngleMode = 'deg';
            angleToggleBtn.textContent = 'DEG';
            screenAngle.textContent = 'DEG';
        }
    });
}

// 13. Equals (=)
if (equalBtn) {
    equalBtn.addEventListener('click', () => {
        evaluateExpression();
    });
}

// Evaluation Logic
function evaluateExpression() {
    if (currentInput.trim() === '') return;
    try {
        const parser = new Parser(currentInput, activeAngleMode, lastAnswer);
        const result = parser.parse();
        
        let formattedResult;
        if (Number.isInteger(result)) {
            formattedResult = result.toString();
        } else {
            // Limit precision to 10 decimal places, strip trailing zeros
            formattedResult = parseFloat(result.toFixed(10)).toString();
        }

        screenFormula.textContent = currentInput + ' =';
        screenMain.textContent = formattedResult;
        lastAnswer = result;
        currentInput = formattedResult;
        resultDisplayed = true;
    } catch (err) {
        screenFormula.textContent = currentInput;
        screenMain.textContent = err.message || 'Error';
        resultDisplayed = true;
    }
}

// -------------------------------------------------------------
// Mathematical Recursive Descent Parser
// Supports operator precedence, parentheses, implicit mult, factorials, constants, trigonometry
// -------------------------------------------------------------
class Parser {
    constructor(str, angleMode, ansValue) {
        this.str = str;
        this.pos = 0;
        this.angleMode = angleMode;
        this.ansValue = ansValue;
    }

    peek() {
        return this.str[this.pos] || '';
    }

    next() {
        return this.str[this.pos++];
    }

    parse() {
        if (!this.str.trim()) return 0;
        const val = this.parseExpression();
        while (this.peek() === ' ') {
            this.next();
        }
        if (this.pos < this.str.length) {
            throw new Error("Syntax Error");
        }
        return val;
    }

    parseExpression() {
        let val = this.parseTerm();
        while (true) {
            while (this.peek() === ' ') this.next();
            const nextChar = this.peek();
            if (nextChar === '+') {
                this.next();
                val += this.parseTerm();
            } else if (nextChar === '-') {
                this.next();
                val -= this.parseTerm();
            } else {
                break;
            }
        }
        return val;
    }

    parseTerm() {
        let val = this.parseFactor();
        while (true) {
            while (this.peek() === ' ') this.next();
            const nextChar = this.peek();
            if (nextChar === '×' || nextChar === '*') {
                this.next();
                val *= this.parseFactor();
            } else if (nextChar === '÷' || nextChar === '/') {
                this.next();
                const denom = this.parseFactor();
                if (denom === 0) throw new Error("Math Error: Div by 0");
                val /= denom;
            } else if (
                nextChar === '(' || 
                this.isDigit(nextChar) || 
                this.isAlpha(nextChar) || 
                nextChar === '.' || 
                nextChar === 'π' || 
                nextChar === 'e' ||
                nextChar === '√'
            ) {
                // Implicit multiplication
                val *= this.parseFactor();
            } else {
                break;
            }
        }
        return val;
    }

    parseFactor() {
        let val = this.parseExponent();
        while (true) {
            const nextChar = this.peek();
            if (nextChar === '!') {
                this.next();
                val = this.factorial(val);
            } else if (nextChar === '%') {
                this.next();
                val = val / 100;
            } else {
                break;
            }
        }
        return val;
    }

    parseExponent() {
        let val = this.parsePrimary();
        if (this.peek() === '^') {
            this.next();
            const power = this.parseExponent();
            val = Math.pow(val, power);
            if (isNaN(val)) throw new Error("Math Error");
        }
        return val;
    }

    parsePrimary() {
        while (this.peek() === ' ') this.next();
        const char = this.peek();

        if (char === '-') {
            this.next();
            return -this.parsePrimary();
        }
        if (char === '+') {
            this.next();
            return this.parsePrimary();
        }

        if (char === '(') {
            this.next();
            const val = this.parseExpression();
            if (this.peek() === ')') {
                this.next();
            }
            return val;
        }

        if (char === '√') {
            this.next();
            let arg;
            if (this.peek() === '(') {
                this.next();
                arg = this.parseExpression();
                if (this.peek() === ')') this.next();
            } else {
                arg = this.parsePrimary();
            }
            if (arg < 0) throw new Error("Math Error: Sqrt negative");
            return Math.sqrt(arg);
        }

        if (this.isDigit(char) || char === '.') {
            let numStr = '';
            while (this.isDigit(this.peek()) || this.peek() === '.') {
                numStr += this.next();
            }
            const val = parseFloat(numStr);
            if (isNaN(val)) throw new Error("Syntax Error");
            return val;
        }

        if (this.isAlpha(char) || char === 'π' || char === 'e') {
            let name = '';
            while (this.isAlpha(this.peek()) || this.peek() === 'π' || this.peek() === 'e') {
                name += this.next();
            }

            if (name === 'π') return Math.PI;
            if (name === 'e') return Math.E;
            if (name === 'ANS') return this.ansValue;

            if (this.peek() === '(') {
                this.next(); // Consume '('
                const arg = this.parseExpression();
                if (this.peek() === ')') {
                    this.next(); // Consume ')'
                }

                switch (name) {
                    case 'sin':
                        return Math.sin(this.toRadians(arg));
                    case 'cos':
                        return Math.cos(this.toRadians(arg));
                    case 'tan':
                        return Math.tan(this.toRadians(arg));
                    case 'log':
                        if (arg <= 0) throw new Error("Math Error: Log domain");
                        return Math.log10(arg);
                    case 'ln':
                        if (arg <= 0) throw new Error("Math Error: Ln domain");
                        return Math.log(arg);
                    default:
                        throw new Error("Syntax Error: Unknown function");
                }
            } else {
                throw new Error("Syntax Error");
            }
        }

        throw new Error("Syntax Error");
    }

    isDigit(c) {
        return c >= '0' && c <= '9';
    }

    isAlpha(c) {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
    }

    toRadians(val) {
        return this.angleMode === 'deg' ? (val * Math.PI) / 180 : val;
    }

    factorial(n) {
        if (n < 0 || !Number.isInteger(n)) throw new Error("Math Error: Factorial non-integer");
        if (n > 170) throw new Error("Math Error: Overflow");
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    }
}
