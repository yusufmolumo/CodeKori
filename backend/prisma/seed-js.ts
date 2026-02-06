import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const jsLessons = [
    {
        title: "Introduction to JavaScript",
        orderIndex: 1,
        xpReward: 15,
        content: `# Introduction to JavaScript

## What is JavaScript?

**JavaScript** is the programming language of the web. While HTML structures content and CSS styles it, JavaScript makes websites interactive and dynamic.

## Why Learn JavaScript?

**Real-World Examples:**
- When you click "Like" on a post and the counter updates instantly
- When a form validates your email before you submit
- When images slide in a carousel
- When a chat message appears without page refresh

All of this is JavaScript!

## Where JavaScript Runs

1. **In the browser** - Makes web pages interactive
2. **On the server** - Node.js for backend development
3. **Mobile apps** - React Native, Ionic
4. **Desktop apps** - Electron

## Your First JavaScript

### In HTML
\`\`\`html
<script>
    alert("Hello, World!");
</script>
\`\`\`

### External File (Recommended)
\`\`\`html
<script src="script.js"></script>
\`\`\`

### Console Output
\`\`\`javascript
console.log("Hello, World!");
console.log("This appears in browser DevTools");
\`\`\`

## Basic Syntax

\`\`\`javascript
// Single line comment

/* Multi-line
   comment */

// Statements end with semicolon (optional but recommended)
let message = "Hello";
console.log(message);
\`\`\`

## The Browser Console

Open DevTools (F12) → Console tab to:
- Run JavaScript instantly
- See console.log() output
- Debug your code

## Key Takeaways

1. JavaScript adds interactivity to websites
2. It runs in browsers and servers
3. Start with console.log() for debugging
4. Use external files for production code`
    },
    {
        title: "Variables and Data Types",
        orderIndex: 2,
        xpReward: 15,
        content: `# Variables and Data Types

## What are Variables?

Variables are containers that store data values. Think of them as labeled boxes where you keep information.

## Declaring Variables

### let (Recommended for most cases)
\`\`\`javascript
let age = 25;
let name = "Alice";
age = 26; // Can be reassigned
\`\`\`

### const (For values that don't change)
\`\`\`javascript
const PI = 3.14159;
const SITE_NAME = "CodeWarrior";
// PI = 3.14; // Error! Cannot reassign
\`\`\`

### var (Old way, avoid in modern code)
\`\`\`javascript
var oldVariable = "legacy";
\`\`\`

## Data Types

### 1. String (Text)
\`\`\`javascript
let greeting = "Hello, World!";
let name = 'Alice';
let template = \`Hello, \${name}!\`; // Template literal
\`\`\`

### 2. Number
\`\`\`javascript
let age = 25;
let price = 19.99;
let negative = -10;
\`\`\`

### 3. Boolean (true/false)
\`\`\`javascript
let isLoggedIn = true;
let hasPermission = false;
\`\`\`

### 4. Undefined
\`\`\`javascript
let notAssigned;
console.log(notAssigned); // undefined
\`\`\`

### 5. Null (Intentionally empty)
\`\`\`javascript
let emptyValue = null;
\`\`\`

### 6. Array (List of values)
\`\`\`javascript
let fruits = ["apple", "banana", "orange"];
console.log(fruits[0]); // "apple"
\`\`\`

### 7. Object (Key-value pairs)
\`\`\`javascript
let person = {
    name: "Alice",
    age: 25,
    isStudent: true
};
console.log(person.name); // "Alice"
\`\`\`

## Checking Types

\`\`\`javascript
console.log(typeof "Hello");   // "string"
console.log(typeof 42);        // "number"
console.log(typeof true);      // "boolean"
console.log(typeof undefined); // "undefined"
\`\`\`

## Naming Rules

- Start with letter, underscore, or $
- Case-sensitive (age ≠ Age)
- Use camelCase: firstName, lastName
- Be descriptive: userAge, not x`
    },
    {
        title: "Arithmetic Expressions",
        orderIndex: 3,
        xpReward: 15,
        content: `# Arithmetic Expressions

## Math Operations in JavaScript

JavaScript can perform all standard mathematical operations, just like a calculator.

## Basic Operators

| Operator | Operation | Example |
|----------|-----------|---------|
| + | Addition | 5 + 3 = 8 |
| - | Subtraction | 10 - 4 = 6 |
| * | Multiplication | 4 * 3 = 12 |
| / | Division | 15 / 3 = 5 |
| % | Modulus (remainder) | 10 % 3 = 1 |
| ** | Exponentiation | 2 ** 3 = 8 |

## Examples

\`\`\`javascript
let sum = 10 + 5;       // 15
let difference = 20 - 8; // 12
let product = 4 * 7;     // 28
let quotient = 20 / 4;   // 5
let remainder = 17 % 5;  // 2 (17 divided by 5 = 3, remainder 2)
let power = 2 ** 4;      // 16 (2 to the power of 4)
\`\`\`

## Order of Operations

JavaScript follows PEMDAS:
1. **P**arentheses
2. **E**xponents
3. **M**ultiplication / **D**ivision
4. **A**ddition / **S**ubtraction

\`\`\`javascript
let result = 2 + 3 * 4;     // 14 (not 20!)
let correct = (2 + 3) * 4;  // 20
\`\`\`

## Assignment Operators

\`\`\`javascript
let x = 10;

x += 5;  // x = x + 5  → 15
x -= 3;  // x = x - 3  → 12
x *= 2;  // x = x * 2  → 24
x /= 4;  // x = x / 4  → 6
x %= 4;  // x = x % 4  → 2
\`\`\`

## Increment and Decrement

\`\`\`javascript
let count = 10;
count++;  // 11 (same as count = count + 1)
count--;  // 10 (same as count = count - 1)
\`\`\`

## Real-World Example: Shopping Cart

\`\`\`javascript
let itemPrice = 29.99;
let quantity = 3;
let subtotal = itemPrice * quantity;  // 89.97
let tax = subtotal * 0.18;            // 16.19 (18% tax)
let total = subtotal + tax;           // 106.16

console.log("Total: $" + total.toFixed(2)); // "Total: $106.16"
\`\`\``
    },
    {
        title: "User Input",
        orderIndex: 4,
        xpReward: 15,
        content: `# User Input in JavaScript

## Getting Data from Users

Interactive programs need user input. JavaScript provides several ways to get input from users.

## Browser Methods

### prompt()
\`\`\`javascript
let name = prompt("What is your name?");
console.log("Hello, " + name + "!");
\`\`\`

Returns the text user enters, or **null** if cancelled.

### confirm()
\`\`\`javascript
let isAdult = confirm("Are you 18 or older?");
if (isAdult) {
    console.log("Welcome!");
} else {
    console.log("Sorry, you must be 18+");
}
\`\`\`

Returns **true** if OK clicked, **false** if Cancel.

## HTML Form Input

### Getting Input Values
\`\`\`html
<input type="text" id="username">
<button onclick="greet()">Submit</button>
\`\`\`

\`\`\`javascript
function greet() {
    let username = document.getElementById("username").value;
    alert("Hello, " + username);
}
\`\`\`

### Real-Time Input
\`\`\`html
<input type="text" id="search" oninput="handleSearch()">
\`\`\`

\`\`\`javascript
function handleSearch() {
    let query = document.getElementById("search").value;
    console.log("Searching for:", query);
}
\`\`\`

## Event Listeners (Modern Approach)

\`\`\`javascript
const input = document.getElementById("username");

input.addEventListener("input", function(event) {
    console.log("Current value:", event.target.value);
});

input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        console.log("Submitted:", event.target.value);
    }
});
\`\`\`

## Real-World Example: Login Form

\`\`\`javascript
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    if (email === "" || password === "") {
        alert("Please fill in all fields");
        return;
    }
    
    console.log("Logging in:", email);
});
\`\`\``
    },
    {
        title: "Type Conversion",
        orderIndex: 5,
        xpReward: 15,
        content: `# Type Conversion in JavaScript

## Converting Between Types

Sometimes you need to convert data from one type to another. JavaScript provides both implicit and explicit conversion.

## Implicit Conversion (Automatic)

JavaScript automatically converts types in some situations:

\`\`\`javascript
// String + Number = String (concatenation)
console.log("5" + 10);    // "510"
console.log("Age: " + 25); // "Age: 25"

// Number operations try to convert strings
console.log("10" - 5);     // 5
console.log("10" * 2);     // 20
console.log("10" / 2);     // 5
\`\`\`

## Explicit Conversion

### To String
\`\`\`javascript
let num = 42;

String(num);        // "42"
num.toString();     // "42"
num + "";           // "42" (quick trick)
\`\`\`

### To Number
\`\`\`javascript
let str = "42";

Number(str);        // 42
parseInt(str);      // 42 (integer)
parseFloat("3.14"); // 3.14 (decimal)
+str;               // 42 (unary plus)
\`\`\`

### To Boolean
\`\`\`javascript
Boolean(1);         // true
Boolean(0);         // false
Boolean("hello");   // true
Boolean("");        // false
Boolean(null);      // false
Boolean(undefined); // false
\`\`\`

## Falsy Values

These values convert to **false**:
- \`false\`
- \`0\`
- \`""\` (empty string)
- \`null\`
- \`undefined\`
- \`NaN\`

Everything else is **truthy**!

## Common Pitfalls

\`\`\`javascript
console.log("5" + 10);    // "510" (string)
console.log(5 + "10");    // "510" (string)
console.log(5 + 10 + "15"); // "1515" (left to right)
\`\`\`

## Real-World Example: Form Data

\`\`\`javascript
// Form inputs are always strings!
let ageInput = document.getElementById("age").value; // "25"
let age = parseInt(ageInput); // 25

// Calculate birth year
let currentYear = new Date().getFullYear();
let birthYear = currentYear - age;
console.log("Born in:", birthYear);
\`\`\``
    },
    {
        title: "Constants (const)",
        orderIndex: 6,
        xpReward: 15,
        content: `# Constants in JavaScript

## What is const?

The \`const\` keyword declares a variable that cannot be reassigned. Use it for values that should never change.

## Basic Usage

\`\`\`javascript
const PI = 3.14159;
const MAX_USERS = 100;
const SITE_URL = "https://codewarrior.io";

// PI = 3.14; // Error: Assignment to constant variable
\`\`\`

## const vs let

| Feature | const | let |
|---------|-------|-----|
| Can reassign? | No | Yes |
| Block scoped? | Yes | Yes |
| Must initialize? | Yes | No |

## When to Use const

**Use const when:**
- Configuration values
- Mathematical constants
- API URLs
- DOM element references
- Array/Object that won't be reassigned

\`\`\`javascript
const API_KEY = "abc123";
const primaryBtn = document.getElementById("primary");
const userSettings = { theme: "dark", language: "en" };
\`\`\`

## Important: Objects and Arrays

\`const\` prevents reassignment, NOT modification:

\`\`\`javascript
const user = { name: "Alice" };
user.name = "Bob";  // OK! Modifying property
// user = {};       // Error! Reassigning

const numbers = [1, 2, 3];
numbers.push(4);    // OK! [1, 2, 3, 4]
// numbers = [];    // Error! Reassigning
\`\`\`

## Best Practices

1. **Prefer const by default**
2. Use let only when you need to reassign
3. Use UPPER_SNAKE_CASE for true constants
4. Use camelCase for const object references

\`\`\`javascript
// True constants (never change)
const MAX_RETRIES = 3;
const BASE_URL = "https://api.example.com";

// References that won't be reassigned
const form = document.getElementById("loginForm");
const config = { timeout: 5000 };
\`\`\`

## Real-World Example

\`\`\`javascript
const TAX_RATE = 0.18;
const SHIPPING_FEE = 5.99;

function calculateTotal(subtotal) {
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + SHIPPING_FEE;
    return total;
}
\`\`\``
    },
    {
        title: "Math Methods",
        orderIndex: 7,
        xpReward: 15,
        content: `# Math Methods in JavaScript

## The Math Object

JavaScript provides a built-in \`Math\` object with useful mathematical methods and constants.

## Math Constants

\`\`\`javascript
Math.PI;      // 3.141592653589793
Math.E;       // 2.718281828459045 (Euler's number)
Math.SQRT2;   // 1.4142135623730951 (Square root of 2)
\`\`\`

## Common Methods

### Rounding
\`\`\`javascript
Math.round(4.5);  // 5 (rounds to nearest)
Math.round(4.4);  // 4

Math.floor(4.9);  // 4 (rounds down)
Math.ceil(4.1);   // 5 (rounds up)

Math.trunc(4.9);  // 4 (removes decimals)
\`\`\`

### Absolute Value
\`\`\`javascript
Math.abs(-10);   // 10
Math.abs(10);    // 10
\`\`\`

### Min and Max
\`\`\`javascript
Math.min(5, 10, 3, 8);  // 3
Math.max(5, 10, 3, 8);  // 10

// With array
const nums = [5, 10, 3, 8];
Math.min(...nums);  // 3
Math.max(...nums);  // 10
\`\`\`

### Power and Square Root
\`\`\`javascript
Math.pow(2, 3);   // 8 (2³)
Math.sqrt(16);    // 4
Math.cbrt(27);    // 3 (cube root)
\`\`\`

### Random Numbers
\`\`\`javascript
Math.random();              // 0.0 to 0.999...
Math.random() * 10;         // 0 to 9.999...
Math.floor(Math.random() * 10);     // 0 to 9
Math.floor(Math.random() * 10) + 1; // 1 to 10
\`\`\`

## Random Number Function

\`\`\`javascript
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

getRandomInt(1, 100);  // Random between 1 and 100
\`\`\`

## Real-World Examples

### Calculate Circle Area
\`\`\`javascript
function circleArea(radius) {
    return Math.PI * Math.pow(radius, 2);
}
console.log(circleArea(5));  // 78.54
\`\`\`

### Price Formatting
\`\`\`javascript
let price = 19.456;
let rounded = Math.round(price * 100) / 100;  // 19.46
\`\`\``
    },
    {
        title: "Hypotenuse Calculator Practice",
        orderIndex: 8,
        xpReward: 20,
        content: `# Hypotenuse Calculator Practice

## Building a Real Calculator

Let's apply what we've learned to build a practical program: calculating the hypotenuse of a right triangle.

## The Math Behind It

**Pythagorean Theorem:**
\`\`\`
a² + b² = c²
c = √(a² + b²)
\`\`\`

Where:
- a and b are the two shorter sides
- c is the hypotenuse (longest side)

## Step 1: Basic Calculation

\`\`\`javascript
function calculateHypotenuse(a, b) {
    const aSquared = a * a;
    const bSquared = b * b;
    const cSquared = aSquared + bSquared;
    const c = Math.sqrt(cSquared);
    return c;
}

console.log(calculateHypotenuse(3, 4)); // 5
\`\`\`

## Step 2: Using Math.pow()

\`\`\`javascript
function calculateHypotenuse(a, b) {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}
\`\`\`

## Step 3: Built-in Method (Easiest!)

\`\`\`javascript
function calculateHypotenuse(a, b) {
    return Math.hypot(a, b);
}

console.log(calculateHypotenuse(3, 4)); // 5
\`\`\`

## Complete Interactive Program

\`\`\`html
<h2>Hypotenuse Calculator</h2>
<input type="number" id="sideA" placeholder="Side A">
<input type="number" id="sideB" placeholder="Side B">
<button onclick="calculate()">Calculate</button>
<p id="result"></p>
\`\`\`

\`\`\`javascript
function calculate() {
    const a = parseFloat(document.getElementById("sideA").value);
    const b = parseFloat(document.getElementById("sideB").value);
    
    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
        document.getElementById("result").textContent = 
            "Please enter valid positive numbers";
        return;
    }
    
    const hypotenuse = Math.hypot(a, b);
    const rounded = Math.round(hypotenuse * 100) / 100;
    
    document.getElementById("result").textContent = 
        \`Hypotenuse = \${rounded}\`;
}
\`\`\`

## Practice Exercises

1. Modify the program to also show the calculation steps
2. Add validation for maximum values
3. Display the result with different decimal places
4. Create a visual representation of the triangle`
    },
    {
        title: "Counter Program Practice",
        orderIndex: 9,
        xpReward: 20,
        content: `# Counter Program Practice

## Building an Interactive Counter

Let's build a click counter - a common component in many applications.

## Basic Counter

\`\`\`html
<h1 id="count">0</h1>
<button onclick="increment()">+</button>
<button onclick="decrement()">-</button>
<button onclick="reset()">Reset</button>
\`\`\`

\`\`\`javascript
let count = 0;

function updateDisplay() {
    document.getElementById("count").textContent = count;
}

function increment() {
    count++;
    updateDisplay();
}

function decrement() {
    if (count > 0) count--;
    updateDisplay();
}

function reset() {
    count = 0;
    updateDisplay();
}
\`\`\`

## Enhanced Counter with Color

\`\`\`javascript
function updateDisplay() {
    const display = document.getElementById("count");
    display.textContent = count;
    
    if (count > 0) {
        display.style.color = "green";
    } else if (count < 0) {
        display.style.color = "red";
    } else {
        display.style.color = "black";
    }
}
\`\`\`

## Counter with Step Size

\`\`\`html
<input type="number" id="step" value="1" min="1">
\`\`\`

\`\`\`javascript
function getStep() {
    return parseInt(document.getElementById("step").value) || 1;
}

function increment() {
    count += getStep();
    updateDisplay();
}

function decrement() {
    count -= getStep();
    updateDisplay();
}
\`\`\`

## Modern Approach with Event Listeners

\`\`\`javascript
const countDisplay = document.getElementById("count");
const incrementBtn = document.getElementById("increment");
const decrementBtn = document.getElementById("decrement");
const resetBtn = document.getElementById("reset");

let count = 0;

function render() {
    countDisplay.textContent = count;
    countDisplay.className = count > 0 ? "positive" : 
                             count < 0 ? "negative" : "zero";
}

incrementBtn.addEventListener("click", () => {
    count++;
    render();
});

decrementBtn.addEventListener("click", () => {
    count--;
    render();
});

resetBtn.addEventListener("click", () => {
    count = 0;
    render();
});

// Initial render
render();
\`\`\`

## Practice Challenges

1. Add a maximum and minimum limit
2. Save count to localStorage
3. Add keyboard shortcuts (+, -, R)
4. Create multiple independent counters`
    },
    {
        title: "Random Number Generator Practice",
        orderIndex: 10,
        xpReward: 25,
        content: `# Random Number Generator Practice

## Building Random Number Tools

Random numbers are used in games, simulations, and many applications. Let's build several random number tools!

## Basic Random Number

\`\`\`javascript
// Random between min and max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

console.log(getRandomNumber(1, 100)); // 1-100
console.log(getRandomNumber(1, 6));   // Dice roll
\`\`\`

## Dice Roller

\`\`\`html
<div id="dice">🎲</div>
<button onclick="rollDice()">Roll!</button>
\`\`\`

\`\`\`javascript
function rollDice() {
    const roll = getRandomNumber(1, 6);
    const diceEmoji = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    document.getElementById("dice").textContent = diceEmoji[roll - 1];
}
\`\`\`

## Random Color Generator

\`\`\`javascript
function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Or using RGB
function getRandomRGB() {
    const r = getRandomNumber(0, 255);
    const g = getRandomNumber(0, 255);
    const b = getRandomNumber(0, 255);
    return \`rgb(\${r}, \${g}, \${b})\`;
}

document.body.style.backgroundColor = getRandomColor();
\`\`\`

## Password Generator

\`\`\`javascript
function generatePassword(length = 12) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    
    return password;
}

console.log(generatePassword(16)); // Strong 16-char password
\`\`\`

## Random Quote Display

\`\`\`javascript
const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Code is like humor. When you have to explain it, it's bad. - Cory House",
    "First, solve the problem. Then, write the code. - John Johnson"
];

function showRandomQuote() {
    const index = getRandomNumber(0, quotes.length - 1);
    document.getElementById("quote").textContent = quotes[index];
}
\`\`\`

## 🎉 Congratulations!

You've completed the Introduction to Software Development course!

**What you learned:**
- HTML - Structure web pages
- CSS - Style and design
- JavaScript - Add interactivity

**Next Steps:**
- Practice building projects
- Learn frameworks (React, Vue)
- Explore backend development
- Build your portfolio!

Keep coding! 🚀`
    }
];

async function seedJS() {
    console.log('🌱 Adding JavaScript lessons...');

    // Find the existing course
    const course = await prisma.course.findFirst({
        where: { title: 'Introduction to Software Development' }
    });

    if (!course) {
        console.log('❌ Course not found. Run seed-course.ts first.');
        return;
    }

    // Create JS Module
    const jsModule = await prisma.module.create({
        data: {
            courseId: course.id,
            title: 'JavaScript Essentials',
            description: 'Add interactivity with JavaScript',
            orderIndex: 3
        }
    });

    for (const lesson of jsLessons) {
        await prisma.lesson.create({
            data: {
                moduleId: jsModule.id,
                ...lesson,
                readingTimeMinutes: 12
            }
        });
    }

    console.log('✅ Created 10 JavaScript lessons');
    console.log('🎉 All 30 lessons complete!');
}

seedJS()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
