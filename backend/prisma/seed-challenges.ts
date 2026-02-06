import { PrismaClient, ChallengeDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

const challenges: { title: string; description: string; difficulty: ChallengeDifficulty; xpReward: number; starterCode: string; hints: string[] }[] = [
    // EASY CHALLENGES (10)
    {
        title: "Create a Variable",
        description: "Declare a variable called `name` and assign it the value 'CodeWarrior'. Use `let` or `const`.",
        difficulty: "EASY",
        xpReward: 25,
        starterCode: "// Declare your variable below\n",
        hints: ["Use the `let` or `const` keyword", "Syntax: let variableName = 'value';", "Module 3, Lesson 2 covers variables"]
    },
    {
        title: "HTML Paragraph",
        description: "Create an HTML paragraph element with the text 'Hello, World!' inside it.",
        difficulty: "EASY",
        xpReward: 25,
        starterCode: "<!-- Create your paragraph below -->\n",
        hints: ["Paragraphs use the <p> tag", "Don't forget the closing tag </p>", "Module 1, Lesson 5 covers text formatting"]
    },
    {
        title: "CSS Background Color",
        description: "Write CSS to give a div with class 'box' a blue background color.",
        difficulty: "EASY",
        xpReward: 25,
        starterCode: "/* Write your CSS below */\n",
        hints: ["Use the .box selector", "The property is background-color", "Module 2, Lesson 4 covers backgrounds"]
    },
    {
        title: "Basic Math Operation",
        description: "Create a variable called `sum` that stores the result of 15 + 27.",
        difficulty: "EASY",
        xpReward: 25,
        starterCode: "// Calculate the sum\n",
        hints: ["Use const or let to declare the variable", "Assign using the = operator", "Module 3, Lesson 3 covers arithmetic"]
    },
    {
        title: "HTML Heading",
        description: "Create the largest HTML heading (h1) with the text 'Welcome to My Website'.",
        difficulty: "EASY",
        xpReward: 25,
        starterCode: "<!-- Create your heading below -->\n",
        hints: ["h1 is the largest heading", "Use <h1> and </h1> tags", "Module 1, Lesson 5 covers text formatting"]
    },
    {
        title: "CSS Font Size",
        description: "Write CSS to give all paragraph elements a font size of 18 pixels.",
        difficulty: "EASY",
        xpReward: 25,
        starterCode: "/* Style paragraphs */\n",
        hints: ["Use the p selector", "The property is font-size", "Module 2, Lesson 2 covers fonts"]
    },
    {
        title: "Boolean Variable",
        description: "Create a variable called `isLoggedIn` and set it to true.",
        difficulty: "EASY",
        xpReward: 25,
        starterCode: "// Create your boolean variable\n",
        hints: ["Booleans are lowercase: true or false", "Use let or const", "Module 3, Lesson 2 covers data types"]
    },
    {
        title: "HTML Link",
        description: "Create a link that says 'Visit Google' and links to https://google.com.",
        difficulty: "EASY",
        xpReward: 25,
        starterCode: "<!-- Create your link below -->\n",
        hints: ["Use the <a> anchor tag", "href attribute contains the URL", "Module 1, Lesson 2 covers hyperlinks"]
    },
    {
        title: "CSS Text Color",
        description: "Write CSS to make all h1 elements have red colored text.",
        difficulty: "EASY",
        xpReward: 25,
        starterCode: "/* Style headings */\n",
        hints: ["Use the h1 selector", "The property is color", "Module 2, Lesson 2 covers fonts"]
    },
    {
        title: "String Concatenation",
        description: "Create a variable `greeting` that combines firstName 'John' and lastName 'Doe' with a space between them.",
        difficulty: "EASY",
        xpReward: 25,
        starterCode: "const firstName = 'John';\nconst lastName = 'Doe';\n// Create greeting variable\n",
        hints: ["Use the + operator to join strings", "Don't forget the space between names", "Module 3, Lesson 2 covers strings"]
    },

    // MEDIUM CHALLENGES (10)
    {
        title: "Create a Function",
        description: "Write a function called `double` that takes a number and returns it multiplied by 2.",
        difficulty: "MEDIUM",
        xpReward: 50,
        starterCode: "// Write your function below\n",
        hints: ["Use function keyword or arrow function", "Use the return keyword", "Module 3, Lesson 8 covers functions"]
    },
    {
        title: "HTML Form",
        description: "Create an HTML form with an email input field and a submit button.",
        difficulty: "MEDIUM",
        xpReward: 50,
        starterCode: "<!-- Create your form below -->\n",
        hints: ["Use <form> tag", "Input type='email'", "Button type='submit'"]
    },
    {
        title: "CSS Flexbox Center",
        description: "Write CSS to center a child element both horizontally and vertically in a parent with class 'container' using flexbox.",
        difficulty: "MEDIUM",
        xpReward: 50,
        starterCode: "/* Center using flexbox */\n",
        hints: ["Use display: flex", "justify-content: center", "align-items: center"]
    },
    {
        title: "Array Methods",
        description: "Create an array of numbers [1, 2, 3, 4, 5] and use the map method to double each value.",
        difficulty: "MEDIUM",
        xpReward: 50,
        starterCode: "// Create array and use map\n",
        hints: ["Create array with square brackets", "map() takes a function", "Return the doubled value"]
    },
    {
        title: "HTML Table",
        description: "Create an HTML table with 2 rows and 3 columns. Include header row and data row.",
        difficulty: "MEDIUM",
        xpReward: 50,
        starterCode: "<!-- Create your table -->\n",
        hints: ["Use <table>, <tr>, <th>, <td>", "First row uses <th> for headers", "Module 1, Lesson 7 covers tables"]
    },
    {
        title: "CSS Hover Effect",
        description: "Write CSS to change a button's background color to green when hovered over.",
        difficulty: "MEDIUM",
        xpReward: 50,
        starterCode: "/* Add hover effect */\n",
        hints: ["Use button:hover selector", "Set background-color property", "Module 2, Lesson 8 covers pseudo classes"]
    },
    {
        title: "Object Creation",
        description: "Create an object called `person` with properties: name, age, and city.",
        difficulty: "MEDIUM",
        xpReward: 50,
        starterCode: "// Create your object\n",
        hints: ["Use curly braces {}", "Properties use key: value format", "Separate properties with commas"]
    },
    {
        title: "HTML Image Gallery",
        description: "Create a simple image gallery with 3 images wrapped in a div with class 'gallery'.",
        difficulty: "MEDIUM",
        xpReward: 50,
        starterCode: "<!-- Create your gallery -->\n",
        hints: ["Use <img> tags with src and alt", "Wrap in <div class='gallery'>", "Module 1, Lesson 3 covers images"]
    },
    {
        title: "CSS Card Design",
        description: "Write CSS for a card with class 'card' that has padding, border-radius, and box-shadow.",
        difficulty: "MEDIUM",
        xpReward: 50,
        starterCode: "/* Style the card */\n",
        hints: ["Use .card selector", "Add padding, border-radius, box-shadow", "Module 2, Lesson 10 covers shadows"]
    },
    {
        title: "Conditional Statement",
        description: "Write an if-else statement that checks if `age` is 18 or older and logs 'Adult' or 'Minor'.",
        difficulty: "MEDIUM",
        xpReward: 50,
        starterCode: "const age = 20;\n// Write your if-else statement\n",
        hints: ["Use if (condition) syntax", "Compare using >= operator", "Include else block"]
    },

    // HARD CHALLENGES (10)
    {
        title: "FizzBuzz Function",
        description: "Write a function that returns 'Fizz' for multiples of 3, 'Buzz' for multiples of 5, 'FizzBuzz' for both, or the number itself.",
        difficulty: "HARD",
        xpReward: 100,
        starterCode: "function fizzBuzz(n) {\n  // Your code here\n}\n",
        hints: ["Check for divisibility with %", "Check FizzBuzz first", "Use if-else-if chain"]
    },
    {
        title: "Responsive Navigation",
        description: "Create a responsive navigation bar using HTML and CSS that collapses on smaller screens.",
        difficulty: "HARD",
        xpReward: 100,
        starterCode: "<!-- Navigation HTML -->\n\n/* Navigation CSS */\n",
        hints: ["Use flexbox for layout", "Use @media queries", "Hide/show elements based on screen size"]
    },
    {
        title: "Array Filter and Reduce",
        description: "Given an array of numbers, filter out even numbers and sum the remaining odd numbers using reduce.",
        difficulty: "HARD",
        xpReward: 100,
        starterCode: "const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\n// Filter and reduce\n",
        hints: ["Use filter() first", "Odd numbers: num % 2 !== 0", "reduce() takes accumulator and current"]
    },
    {
        title: "CSS Grid Layout",
        description: "Create a 3-column layout using CSS Grid where the middle column is twice as wide as the others.",
        difficulty: "HARD",
        xpReward: 100,
        starterCode: "/* Create grid layout */\n",
        hints: ["Use display: grid", "grid-template-columns: 1fr 2fr 1fr", "Module 2, Lesson 7 covers position"]
    },
    {
        title: "Counter with Closure",
        description: "Write a function that returns another function which increments and returns a counter each time it's called.",
        difficulty: "HARD",
        xpReward: 100,
        starterCode: "function createCounter() {\n  // Your code here\n}\n",
        hints: ["Use a variable in outer function", "Return an inner function", "Inner function accesses outer variable"]
    },
    {
        title: "Form Validation",
        description: "Write JavaScript to validate a form with email and password fields. Show error messages for invalid inputs.",
        difficulty: "HARD",
        xpReward: 100,
        starterCode: "function validateForm() {\n  // Your code here\n}\n",
        hints: ["Use regex for email", "Check password length", "Return true/false for valid/invalid"]
    },
    {
        title: "CSS Animation",
        description: "Create a CSS animation that makes an element fade in from transparent to fully visible over 2 seconds.",
        difficulty: "HARD",
        xpReward: 100,
        starterCode: "/* Create fade-in animation */\n",
        hints: ["Use @keyframes", "Animate opacity from 0 to 1", "Use animation property"]
    },
    {
        title: "Recursive Factorial",
        description: "Write a recursive function that calculates the factorial of a number.",
        difficulty: "HARD",
        xpReward: 100,
        starterCode: "function factorial(n) {\n  // Your code here\n}\n",
        hints: ["Base case: n <= 1 returns 1", "Recursive case: n * factorial(n-1)", "Function calls itself"]
    },
    {
        title: "Debounce Function",
        description: "Implement a debounce function that limits how often a callback can be called.",
        difficulty: "HARD",
        xpReward: 100,
        starterCode: "function debounce(callback, delay) {\n  // Your code here\n}\n",
        hints: ["Use setTimeout", "Clear previous timeout", "Return a new function"]
    },
    {
        title: "DOM Manipulation",
        description: "Write JavaScript to create a todo list where users can add items, mark them complete, and delete them.",
        difficulty: "HARD",
        xpReward: 100,
        starterCode: "// Todo list functionality\n",
        hints: ["Use createElement", "Add event listeners", "Use appendChild and removeChild"]
    }
];

async function seedChallenges() {
    console.log('🎯 Seeding 30 challenges...');

    for (const challenge of challenges) {
        await prisma.codingChallenge.create({
            data: challenge
        });
    }

    console.log('✅ Created 30 challenges');
    console.log('   - 10 Easy (25 XP each)');
    console.log('   - 10 Medium (50 XP each)');
    console.log('   - 10 Hard (100 XP each)');
    console.log('🎉 Challenges seed completed!');
}

seedChallenges()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
