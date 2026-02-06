import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const htmlLessons = [
    {
        title: "Introduction to HTML",
        orderIndex: 1,
        xpReward: 15,
        content: `# Introduction to HTML

## What is HTML?

**HTML** stands for **HyperText Markup Language**. It is the standard language used to create and structure content on web pages.

Think of HTML as the skeleton of a website. Just like bones give structure to our body, HTML gives structure to web pages. It tells the browser what each piece of content is - whether it's a heading, a paragraph, an image, or a link.

## Why Learn HTML?

HTML is the foundation of web development. Every website you visit - from Google to YouTube to your favorite online store - is built using HTML at its core.

**Real-World Example:**
When you read an article online, the title is wrapped in a heading tag, paragraphs are in paragraph tags, and images are embedded with image tags. HTML organizes all this content so browsers can display it correctly.

## Your First HTML Document

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
</body>
</html>
\`\`\`

### Breaking It Down:

- **<!DOCTYPE html>** - Tells the browser this is an HTML5 document
- **<html>** - The root element containing all content
- **<head>** - Contains metadata like the page title
- **<body>** - Contains visible content

## Key Takeaways

1. HTML is the backbone of all websites
2. It uses tags to structure content
3. Every HTML document follows a basic structure
4. Learning HTML is the first step to becoming a web developer`
    },
    {
        title: "Hyperlinks",
        orderIndex: 2,
        xpReward: 15,
        content: `# Hyperlinks in HTML

## What are Hyperlinks?

**Hyperlinks**, commonly called **links**, are the foundation of the World Wide Web. They allow users to navigate from one page to another with a single click.

**Real-World Example:**
When you're reading a Wikipedia article and click on a blue underlined word to learn more about that topic - that's a hyperlink in action!

## The Anchor Tag

Links are created using the \`<a>\` (anchor) tag:

\`\`\`html
<a href="https://google.com">Visit Google</a>
\`\`\`

### Key Attributes:

| Attribute | Purpose | Example |
|-----------|---------|---------|
| **href** | URL destination | "https://example.com" |
| **target** | Where to open link | "_blank" (new tab) |
| **title** | Hover tooltip | "Click to visit" |

## Types of Links

### 1. External Links
\`\`\`html
<a href="https://youtube.com" target="_blank">Watch Videos</a>
\`\`\`

### 2. Internal Links (Same Website)
\`\`\`html
<a href="/about.html">About Us</a>
\`\`\`

### 3. Email Links
\`\`\`html
<a href="mailto:hello@example.com">Send Email</a>
\`\`\`

### 4. Phone Links
\`\`\`html
<a href="tel:+250123456789">Call Us</a>
\`\`\`

## Best Practices

1. **Use descriptive text** - "Learn more about our services" is better than "Click here"
2. **Open external links in new tabs** - Use \`target="_blank"\`
3. **Add titles for accessibility** - Helps screen readers

## Practice Exercise

Create a navigation menu with 3 links to your favorite websites!`
    },
    {
        title: "Images",
        orderIndex: 3,
        xpReward: 15,
        content: `# Images in HTML

## Adding Images to Web Pages

Images make websites visually appealing and help communicate ideas quickly. The \`<img>\` tag is used to embed images.

## The Image Tag

\`\`\`html
<img src="photo.jpg" alt="A beautiful sunset">
\`\`\`

**Important:** The \`<img>\` tag is self-closing - it doesn't need a closing tag!

## Essential Attributes

### src (Source)
The path to your image file:

\`\`\`html
<!-- Local image -->
<img src="images/logo.png" alt="Company Logo">

<!-- External image -->
<img src="https://example.com/photo.jpg" alt="Example Photo">
\`\`\`

### alt (Alternative Text)
Describes the image for:
- Screen readers (accessibility)
- When image fails to load
- Search engine optimization (SEO)

**Real-World Example:**
An online store shows product images. If a laptop image has \`alt="MacBook Pro 16-inch Silver"\`, visually impaired users know exactly what product they're viewing.

## Sizing Images

\`\`\`html
<img src="photo.jpg" alt="Photo" width="400" height="300">
\`\`\`

**Pro Tip:** Use CSS for responsive sizing instead of fixed dimensions!

## Image Formats

| Format | Best For |
|--------|----------|
| **JPEG** | Photos, complex images |
| **PNG** | Logos, transparency needed |
| **GIF** | Simple animations |
| **WebP** | Modern, smaller file size |
| **SVG** | Icons, scalable graphics |

## Complete Example

\`\`\`html
<figure>
    <img src="team.jpg" alt="Our team at the annual conference" width="600">
    <figcaption>Our team at the 2024 Tech Conference</figcaption>
</figure>
\`\`\`

The \`<figure>\` and \`<figcaption>\` tags add semantic meaning to your images!`
    },
    {
        title: "Audio & Video",
        orderIndex: 4,
        xpReward: 15,
        content: `# Audio and Video in HTML

## Multimedia on the Web

Modern HTML makes it easy to embed audio and video directly into web pages without plugins.

## The Audio Tag

\`\`\`html
<audio controls>
    <source src="song.mp3" type="audio/mpeg">
    <source src="song.ogg" type="audio/ogg">
    Your browser doesn't support audio.
</audio>
\`\`\`

### Audio Attributes

| Attribute | Description |
|-----------|-------------|
| **controls** | Shows play/pause buttons |
| **autoplay** | Starts automatically |
| **loop** | Repeats when finished |
| **muted** | Starts muted |

**Real-World Example:**
Podcast websites use the audio tag to let visitors listen to episodes directly in their browser.

## The Video Tag

\`\`\`html
<video width="640" height="360" controls>
    <source src="movie.mp4" type="video/mp4">
    <source src="movie.webm" type="video/webm">
    Your browser doesn't support video.
</video>
\`\`\`

### Video Attributes

| Attribute | Description |
|-----------|-------------|
| **poster** | Preview image before play |
| **width/height** | Dimensions |
| **controls** | Show playback controls |
| **autoplay** | Auto-start (use with muted) |

## Embedding YouTube Videos

For YouTube, use an iframe:

\`\`\`html
<iframe 
    width="560" 
    height="315" 
    src="https://www.youtube.com/embed/VIDEO_ID"
    allowfullscreen>
</iframe>
\`\`\`

## Best Practices

1. **Multiple formats** - Provide fallbacks for browser compatibility
2. **Fallback text** - For unsupported browsers
3. **Don't autoplay with sound** - It's annoying!
4. **Use poster images** - Gives context before playing
5. **Consider file size** - Compress videos for faster loading`
    },
    {
        title: "Text Formatting",
        orderIndex: 5,
        xpReward: 15,
        content: `# Text Formatting in HTML

## Making Text Stand Out

HTML provides many tags to format and emphasize text, making your content more readable and meaningful.

## Common Formatting Tags

### Bold and Strong

\`\`\`html
<b>This is bold</b>
<strong>This is strong (important)</strong>
\`\`\`

**Difference:** \`<strong>\` has semantic meaning (important text), while \`<b>\` is just visual.

### Italic and Emphasis

\`\`\`html
<i>This is italic</i>
<em>This is emphasized</em>
\`\`\`

**Real-World Example:**
Book titles are often italicized: *The Great Gatsby*

### Underline and Strikethrough

\`\`\`html
<u>Underlined text</u>
<s>Crossed out text</s>
<del>Deleted text</del>
<ins>Inserted text</ins>
\`\`\`

### Subscript and Superscript

\`\`\`html
H<sub>2</sub>O (Water formula)
E = mc<sup>2</sup> (Einstein's equation)
\`\`\`

## Headings

HTML has 6 heading levels:

\`\`\`html
<h1>Main Title (Largest)</h1>
<h2>Section Heading</h2>
<h3>Subsection</h3>
<h4>Sub-subsection</h4>
<h5>Minor heading</h5>
<h6>Smallest heading</h6>
\`\`\`

**Best Practice:** Use only one \`<h1>\` per page, and don't skip levels!

## Paragraphs and Line Breaks

\`\`\`html
<p>This is a paragraph. It creates space above and below.</p>
<p>This is another paragraph.</p>

First line<br>Second line (same paragraph)
\`\`\`

## Quotations

\`\`\`html
<blockquote>
    "The only way to do great work is to love what you do."
    <cite>- Steve Jobs</cite>
</blockquote>

<p>He said it was <q>absolutely amazing</q>.</p>
\`\`\`

## Code Formatting

\`\`\`html
<code>console.log("Hello")</code>

<pre>
function greet() {
    return "Hello, World!";
}
</pre>
\`\`\`

The \`<pre>\` tag preserves whitespace and formatting!`
    },
    {
        title: "HTML Lists",
        orderIndex: 6,
        xpReward: 15,
        content: `# HTML Lists

## Organizing Information

Lists help organize content in a clear, structured way. HTML provides three types of lists.

## Unordered Lists (Bullet Points)

\`\`\`html
<ul>
    <li>Apples</li>
    <li>Bananas</li>
    <li>Oranges</li>
</ul>
\`\`\`

**Real-World Example:**
Shopping lists, feature lists on product pages, navigation menus.

## Ordered Lists (Numbered)

\`\`\`html
<ol>
    <li>Preheat oven to 350°F</li>
    <li>Mix ingredients</li>
    <li>Pour into baking pan</li>
    <li>Bake for 30 minutes</li>
</ol>
\`\`\`

### Customizing Ordered Lists

\`\`\`html
<ol type="A">  <!-- A, B, C -->
<ol type="a">  <!-- a, b, c -->
<ol type="I">  <!-- I, II, III -->
<ol type="i">  <!-- i, ii, iii -->
<ol start="5"> <!-- Starts at 5 -->
\`\`\`

## Description Lists

Perfect for terms and definitions:

\`\`\`html
<dl>
    <dt>HTML</dt>
    <dd>HyperText Markup Language - structures web content</dd>
    
    <dt>CSS</dt>
    <dd>Cascading Style Sheets - styles web content</dd>
    
    <dt>JavaScript</dt>
    <dd>Programming language - adds interactivity</dd>
</dl>
\`\`\`

## Nested Lists

\`\`\`html
<ul>
    <li>Frontend Technologies
        <ul>
            <li>HTML</li>
            <li>CSS</li>
            <li>JavaScript</li>
        </ul>
    </li>
    <li>Backend Technologies
        <ul>
            <li>Node.js</li>
            <li>Python</li>
            <li>Java</li>
        </ul>
    </li>
</ul>
\`\`\`

## Best Practices

1. Use unordered lists when order doesn't matter
2. Use ordered lists for sequences or rankings
3. Use description lists for glossaries or FAQs
4. Keep list items concise
5. Use nesting sparingly (max 2-3 levels)`
    },
    {
        title: "HTML Tables",
        orderIndex: 7,
        xpReward: 15,
        content: `# HTML Tables

## Displaying Data in Rows and Columns

Tables are perfect for presenting structured data like schedules, pricing, statistics, and comparisons.

## Basic Table Structure

\`\`\`html
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Age</th>
            <th>City</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Alice</td>
            <td>28</td>
            <td>Kigali</td>
        </tr>
        <tr>
            <td>Bob</td>
            <td>32</td>
            <td>Nairobi</td>
        </tr>
    </tbody>
</table>
\`\`\`

## Table Elements

| Tag | Purpose |
|-----|---------|
| \`<table>\` | Container for the table |
| \`<thead>\` | Table header section |
| \`<tbody>\` | Table body section |
| \`<tfoot>\` | Table footer section |
| \`<tr>\` | Table row |
| \`<th>\` | Header cell (bold, centered) |
| \`<td>\` | Data cell |

## Spanning Rows and Columns

### Column Span
\`\`\`html
<tr>
    <td colspan="3">This spans 3 columns</td>
</tr>
\`\`\`

### Row Span
\`\`\`html
<td rowspan="2">This spans 2 rows</td>
\`\`\`

## Real-World Example: Product Comparison

\`\`\`html
<table>
    <thead>
        <tr>
            <th>Feature</th>
            <th>Basic Plan</th>
            <th>Pro Plan</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Storage</td>
            <td>5 GB</td>
            <td>100 GB</td>
        </tr>
        <tr>
            <td>Users</td>
            <td>1</td>
            <td>Unlimited</td>
        </tr>
        <tr>
            <td>Price</td>
            <td>$9/month</td>
            <td>$29/month</td>
        </tr>
    </tbody>
</table>
\`\`\`

## Adding a Caption

\`\`\`html
<table>
    <caption>Quarterly Sales Report 2024</caption>
    <!-- table content -->
</table>
\`\`\`

## Important Notes

1. **Don't use tables for layout** - Use CSS Grid or Flexbox
2. **Keep tables simple** - Complex tables are hard to read
3. **Use thead, tbody, tfoot** - Better semantics and styling
4. **Add scope attribute** - Improves accessibility`
    },
    {
        title: "HTML Colors",
        orderIndex: 8,
        xpReward: 15,
        content: `# HTML Colors

## Adding Color to Your Web Pages

Colors bring life to websites! HTML and CSS offer multiple ways to specify colors.

## Color Formats

### 1. Color Names

HTML supports 140+ named colors:

\`\`\`html
<p style="color: red;">Red text</p>
<p style="color: dodgerblue;">Dodger blue text</p>
<p style="color: coral;">Coral text</p>
\`\`\`

Common color names: red, blue, green, yellow, orange, purple, pink, black, white, gray

### 2. Hexadecimal (Hex) Colors

Format: #RRGGBB (Red, Green, Blue)

\`\`\`html
<p style="color: #FF0000;">Pure Red</p>
<p style="color: #00FF00;">Pure Green</p>
<p style="color: #0000FF;">Pure Blue</p>
<p style="color: #1E90FF;">Dodger Blue</p>
\`\`\`

**Shorthand:** #RGB → #F00 = #FF0000

### 3. RGB Values

Format: rgb(red, green, blue) - values 0-255

\`\`\`html
<p style="color: rgb(255, 0, 0);">Red</p>
<p style="color: rgb(0, 128, 0);">Green</p>
<p style="color: rgb(30, 144, 255);">Dodger Blue</p>
\`\`\`

### 4. RGBA (With Transparency)

Format: rgba(red, green, blue, alpha) - alpha 0-1

\`\`\`html
<p style="color: rgba(255, 0, 0, 0.5);">50% transparent red</p>
\`\`\`

### 5. HSL (Hue, Saturation, Lightness)

\`\`\`html
<p style="color: hsl(0, 100%, 50%);">Red</p>
<p style="color: hsl(240, 100%, 50%);">Blue</p>
<p style="color: hsla(120, 100%, 50%, 0.5);">50% transparent green</p>
\`\`\`

## Where to Apply Colors

\`\`\`html
<!-- Text color -->
<p style="color: navy;">Navy text</p>

<!-- Background color -->
<div style="background-color: lightyellow;">Yellow background</div>

<!-- Border color -->
<p style="border: 2px solid crimson;">Red border</p>
\`\`\`

## Real-World Color Schemes

**Corporate Blue:** #0066CC, #003366
**Success Green:** #28A745, #155724
**Warning Orange:** #FFC107, #856404
**Error Red:** #DC3545, #721C24

## Color Tips

1. **Contrast is key** - Ensure text is readable
2. **Consistency matters** - Use a color palette
3. **Test accessibility** - Use color contrast checkers
4. **Less is more** - 3-5 colors max for most designs`
    },
    {
        title: "HTML Span & Div",
        orderIndex: 9,
        xpReward: 15,
        content: `# HTML Span & Div

## Container Elements

\`<div>\` and \`<span>\` are the two most commonly used container elements in HTML. They help group and style content.

## The Div Element

\`<div>\` is a **block-level** container - it takes up the full width available.

\`\`\`html
<div>
    <h2>Article Title</h2>
    <p>This is the article content.</p>
</div>
\`\`\`

**Real-World Uses:**
- Page sections (header, footer, sidebar)
- Card layouts
- Content containers
- Grid and flex containers

## The Span Element

\`<span>\` is an **inline** container - it only takes up needed space.

\`\`\`html
<p>My favorite color is <span style="color: blue;">blue</span>.</p>
\`\`\`

**Real-World Uses:**
- Highlighting text
- Styling part of a sentence
- Adding icons beside text
- Wrapping text for JavaScript manipulation

## Key Differences

| Feature | \`<div>\` | \`<span>\` |
|---------|---------|----------|
| Display | Block | Inline |
| Width | Full width | Content width |
| Line Break | Creates line break | No line break |
| Use Case | Sections/containers | Text portions |

## Practical Examples

### Creating a Card Layout
\`\`\`html
<div class="card">
    <div class="card-header">
        <h3>Product Name</h3>
    </div>
    <div class="card-body">
        <p>Product description goes here.</p>
        <span class="price">$29.99</span>
        <span class="badge">Sale</span>
    </div>
</div>
\`\`\`

### Styling Inline Elements
\`\`\`html
<p>
    Status: <span class="success">Active</span>
    | Last login: <span class="date">Today</span>
</p>
\`\`\`

## Semantic Alternatives

Instead of generic divs, consider semantic elements:

| Instead of \`<div>\` | Use |
|-------------------|-----|
| Page header | \`<header>\` |
| Navigation | \`<nav>\` |
| Main content | \`<main>\` |
| Sidebar | \`<aside>\` |
| Article | \`<article>\` |
| Section | \`<section>\` |
| Page footer | \`<footer>\` |

## Best Practices

1. Use semantic elements when possible
2. Add classes for styling
3. Don't nest divs unnecessarily
4. Use span for inline styling needs`
    },
    {
        title: "HTML Review Project",
        orderIndex: 10,
        xpReward: 25,
        content: `# HTML Review Project

## Build Your First Web Page!

Congratulations on completing the HTML section! Now let's put everything together.

## Project: Personal Portfolio Page

Create a simple portfolio page that includes:

### Required Elements

1. **Document Structure**
   - Proper DOCTYPE
   - HTML, head, and body tags
   - Page title and meta description

2. **Content Sections**
   - Header with your name (h1)
   - About Me section (h2 + paragraphs)
   - Skills list (unordered list)
   - Education/Experience table
   - Contact section with email link

3. **Media**
   - Profile image with alt text
   - Link to a video or embed a YouTube video

4. **Formatting**
   - Use bold and italic text appropriately
   - Include quotations
   - Add proper headings hierarchy

## Starter Template

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Your Name - Web Developer Portfolio">
    <title>Your Name | Portfolio</title>
</head>
<body>
    <header>
        <h1>Your Name</h1>
        <p>Web Developer | Designer | Problem Solver</p>
    </header>

    <main>
        <section id="about">
            <h2>About Me</h2>
            <!-- Add paragraphs about yourself -->
        </section>

        <section id="skills">
            <h2>Skills</h2>
            <!-- Add unordered list of skills -->
        </section>

        <section id="experience">
            <h2>Experience</h2>
            <!-- Add table with experience -->
        </section>

        <section id="contact">
            <h2>Get In Touch</h2>
            <!-- Add contact links -->
        </section>
    </main>

    <footer>
        <p>&copy; 2024 Your Name. All rights reserved.</p>
    </footer>
</body>
</html>
\`\`\`

## Checklist

- [ ] Valid HTML structure
- [ ] Semantic elements used
- [ ] All images have alt text
- [ ] Links work correctly
- [ ] Content is organized with headings
- [ ] Lists are used appropriately
- [ ] Table displays data correctly

## What's Next?

You've mastered HTML! In the **CSS section**, you'll learn to:
- Style your portfolio with colors and fonts
- Create beautiful layouts
- Add animations and effects
- Make your page responsive

**Great job! Keep learning!** 🎉`
    }
];

const cssLessons = [
    {
        title: "Introduction to CSS",
        orderIndex: 1,
        xpReward: 15,
        content: `# Introduction to CSS

## What is CSS?

**CSS** stands for **Cascading Style Sheets**. While HTML provides the structure of a web page, CSS controls how it looks.

## The Power of CSS

**Real-World Analogy:**
If HTML is the bones of a house (structure), CSS is the paint, wallpaper, furniture, and decorations (style).

## Three Ways to Add CSS

### 1. Inline Styles
\`\`\`html
<p style="color: blue; font-size: 18px;">Blue text</p>
\`\`\`

### 2. Internal Stylesheet
\`\`\`html
<head>
    <style>
        p {
            color: blue;
            font-size: 18px;
        }
    </style>
</head>
\`\`\`

### 3. External Stylesheet (Recommended)
\`\`\`html
<head>
    <link rel="stylesheet" href="styles.css">
</head>
\`\`\`

## CSS Syntax

\`\`\`css
selector {
    property: value;
    property: value;
}
\`\`\`

**Example:**
\`\`\`css
h1 {
    color: navy;
    font-size: 32px;
    text-align: center;
}
\`\`\`

## CSS Selectors

| Selector | Example | Selects |
|----------|---------|---------|
| Element | \`p\` | All paragraphs |
| Class | \`.highlight\` | Elements with class="highlight" |
| ID | \`#header\` | Element with id="header" |
| Universal | \`*\` | All elements |

## Why "Cascading"?

Styles cascade down and can override each other:

1. Browser defaults (lowest priority)
2. External stylesheets
3. Internal stylesheets
4. Inline styles (highest priority)

## Your First Stylesheet

Create \`styles.css\`:
\`\`\`css
body {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    margin: 0;
    padding: 20px;
}

h1 {
    color: #333;
    border-bottom: 2px solid #007bff;
}

p {
    line-height: 1.6;
    color: #666;
}
\`\`\`

## Key Takeaways

1. CSS controls visual appearance
2. External stylesheets are best practice
3. Selectors target HTML elements
4. Properties define the styles`
    },
    {
        title: "CSS Fonts",
        orderIndex: 2,
        xpReward: 15,
        content: `# CSS Fonts

## Typography in Web Design

Good typography makes content readable and creates visual hierarchy. CSS gives you complete control over fonts.

## Font Properties

### font-family
\`\`\`css
body {
    font-family: Arial, Helvetica, sans-serif;
}

h1 {
    font-family: 'Times New Roman', Georgia, serif;
}
\`\`\`

**Font Stacks:** List multiple fonts as fallbacks!

### font-size
\`\`\`css
p { font-size: 16px; }
h1 { font-size: 2.5rem; }  /* 2.5x root size */
small { font-size: 0.875em; }  /* 0.875x parent size */
\`\`\`

### font-weight
\`\`\`css
.light { font-weight: 300; }
.normal { font-weight: 400; }
.bold { font-weight: 700; }
.bolder { font-weight: bold; }
\`\`\`

### font-style
\`\`\`css
.italic { font-style: italic; }
.normal { font-style: normal; }
\`\`\`

## Web Safe Fonts

These fonts work on almost all devices:

**Sans-serif:** Arial, Verdana, Helvetica
**Serif:** Times New Roman, Georgia
**Monospace:** Courier New, Consolas

## Google Fonts

Access thousands of free fonts:

\`\`\`html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
\`\`\`

\`\`\`css
body {
    font-family: 'Roboto', sans-serif;
}
\`\`\`

## Text Properties

\`\`\`css
p {
    text-align: center;      /* left, right, center, justify */
    text-decoration: none;   /* underline, line-through */
    text-transform: uppercase; /* lowercase, capitalize */
    letter-spacing: 1px;     /* Space between letters */
    line-height: 1.6;        /* Line spacing */
    word-spacing: 2px;       /* Space between words */
}
\`\`\`

## Shorthand Property

\`\`\`css
/* font: style weight size/line-height family; */
p {
    font: italic 700 16px/1.5 'Roboto', sans-serif;
}
\`\`\`

## Real-World Typography Scale

\`\`\`css
html { font-size: 16px; }
h1 { font-size: 2.5rem; }   /* 40px */
h2 { font-size: 2rem; }     /* 32px */
h3 { font-size: 1.5rem; }   /* 24px */
p { font-size: 1rem; }      /* 16px */
small { font-size: 0.875rem; } /* 14px */
\`\`\``
    },
    {
        title: "CSS Borders",
        orderIndex: 3,
        xpReward: 15,
        content: `# CSS Borders

## Adding Borders to Elements

Borders create visual boundaries around elements and can significantly impact design.

## Border Properties

### border-width
\`\`\`css
.box {
    border-width: 2px;           /* All sides */
    border-width: 1px 2px 3px 4px; /* Top Right Bottom Left */
}
\`\`\`

### border-style

| Style | Description |
|-------|-------------|
| solid | Continuous line |
| dashed | Dashed line |
| dotted | Dotted line |
| double | Two parallel lines |
| groove | 3D grooved |
| ridge | 3D ridged |
| none | No border |

### border-color
\`\`\`css
.box {
    border-color: #333;
    border-color: red green blue yellow; /* Each side */
}
\`\`\`

## Shorthand

\`\`\`css
/* border: width style color; */
.card {
    border: 1px solid #ddd;
}
\`\`\`

## Individual Sides

\`\`\`css
.element {
    border-top: 2px solid red;
    border-right: 1px dashed blue;
    border-bottom: 3px dotted green;
    border-left: 1px solid black;
}
\`\`\`

## Border Radius (Rounded Corners)

\`\`\`css
.rounded {
    border-radius: 8px;  /* All corners */
}

.circle {
    border-radius: 50%;  /* Perfect circle */
}

.custom {
    border-radius: 10px 20px 30px 40px;
    /* top-left, top-right, bottom-right, bottom-left */
}
\`\`\`

## Real-World Examples

### Card Design
\`\`\`css
.card {
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
\`\`\`

### Button Styles
\`\`\`css
.btn {
    border: 2px solid #007bff;
    border-radius: 25px;
}

.btn:hover {
    border-color: #0056b3;
}
\`\`\`

### Dividers
\`\`\`css
.divider {
    border-bottom: 1px solid #eee;
    margin: 20px 0;
}
\`\`\`

## Pro Tips

1. Use subtle borders (#ddd, #eee) for a clean look
2. Border-radius makes elements feel modern
3. Combine with box-shadow for depth
4. Use border-bottom for subtle separators`
    },
    {
        title: "CSS Background",
        orderIndex: 4,
        xpReward: 15,
        content: `# CSS Background

## Creating Beautiful Backgrounds

Backgrounds set the visual foundation for your content. CSS offers powerful background customization.

## Background Color

\`\`\`css
body {
    background-color: #f5f5f5;
}

.hero {
    background-color: rgba(0, 123, 255, 0.9);
}
\`\`\`

## Background Image

\`\`\`css
.hero {
    background-image: url('hero-bg.jpg');
}
\`\`\`

### Image Properties

\`\`\`css
.section {
    background-image: url('pattern.png');
    background-repeat: no-repeat;  /* repeat, repeat-x, repeat-y */
    background-position: center;   /* top, bottom, left, right */
    background-size: cover;        /* contain, 100%, auto */
    background-attachment: fixed;  /* scroll, local */
}
\`\`\`

## Background Shorthand

\`\`\`css
/* background: color image repeat position/size; */
.hero {
    background: #333 url('bg.jpg') no-repeat center/cover;
}
\`\`\`

## Gradients

### Linear Gradient
\`\`\`css
.gradient {
    background: linear-gradient(to right, #667eea, #764ba2);
}

.diagonal {
    background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb);
}
\`\`\`

### Radial Gradient
\`\`\`css
.radial {
    background: radial-gradient(circle, #fff, #ddd);
}
\`\`\`

## Multiple Backgrounds

\`\`\`css
.layered {
    background:
        url('overlay.png') no-repeat center,
        linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
        url('hero.jpg') no-repeat center/cover;
}
\`\`\`

## Real-World Examples

### Hero Section
\`\`\`css
.hero {
    background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
                url('hero.jpg') no-repeat center/cover;
    height: 100vh;
    color: white;
}
\`\`\`

### Card with Subtle Pattern
\`\`\`css
.card {
    background-color: #fff;
    background-image: url('subtle-pattern.png');
    background-size: 50px 50px;
}
\`\`\`

### Gradient Button
\`\`\`css
.btn-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
}
\`\`\``
    },
    {
        title: "CSS Margins & Padding",
        orderIndex: 5,
        xpReward: 15,
        content: `# CSS Margins and Padding

## The Box Model

Every HTML element is a rectangular box with: Content, Padding, Border, and Margin.

## Understanding the Difference

| Property | Description |
|----------|-------------|
| **Padding** | Space INSIDE the border (around content) |
| **Margin** | Space OUTSIDE the border (between elements) |

## Padding

\`\`\`css
.box {
    padding: 20px;               /* All sides */
    padding: 10px 20px;          /* Top/Bottom, Left/Right */
    padding: 10px 20px 15px 25px; /* Top, Right, Bottom, Left */
}

/* Individual sides */
.element {
    padding-top: 10px;
    padding-right: 20px;
    padding-bottom: 10px;
    padding-left: 20px;
}
\`\`\`

## Margin

\`\`\`css
.box {
    margin: 20px;                /* All sides */
    margin: 10px auto;           /* Center horizontally */
    margin: 0;                   /* Remove default margins */
}

/* Individual sides */
.element {
    margin-top: 10px;
    margin-bottom: 20px;
}
\`\`\`

## Centering Elements

\`\`\`css
.container {
    width: 800px;
    margin: 0 auto;  /* Centers the element */
}
\`\`\`

## Box-Sizing

By default, padding adds to element width. Fix with:

\`\`\`css
* {
    box-sizing: border-box;
}
\`\`\`

Now padding is included in the width!

## Real-World Examples

### Card Spacing
\`\`\`css
.card {
    padding: 24px;
    margin-bottom: 16px;
}
\`\`\`

### Section Layout
\`\`\`css
section {
    padding: 60px 0;
    margin: 0;
}
\`\`\`

### Button Styling
\`\`\`css
.btn {
    padding: 12px 24px;
    margin: 8px;
}
\`\`\`

### Navigation Items
\`\`\`css
nav a {
    padding: 10px 15px;
    margin: 0 5px;
}
\`\`\`

## Margin Collapse

Vertical margins collapse (combine) between elements:

\`\`\`css
.box1 { margin-bottom: 20px; }
.box2 { margin-top: 30px; }
/* Actual gap = 30px (larger wins), not 50px */
\`\`\`

## Pro Tips

1. Use \`margin: 0 auto\` to center block elements
2. Apply \`box-sizing: border-box\` globally
3. Be consistent with spacing values
4. Use relative units (rem, em) for scaling`
    },
    {
        title: "CSS Float",
        orderIndex: 6,
        xpReward: 15,
        content: `# CSS Float

## Floating Elements

The \`float\` property was originally designed for wrapping text around images, but became a layout technique before Flexbox and Grid.

## How Float Works

\`\`\`css
.image {
    float: left;  /* or right */
    margin-right: 15px;
}
\`\`\`

When an element floats, content flows around it.

## Float Values

| Value | Effect |
|-------|--------|
| left | Floats to the left |
| right | Floats to the right |
| none | Default, no float |

## Text Wrapping Example

\`\`\`html
<img src="photo.jpg" class="float-left">
<p>This text will wrap around the image...</p>
\`\`\`

\`\`\`css
.float-left {
    float: left;
    margin: 0 15px 10px 0;
    width: 200px;
}
\`\`\`

## The Clearfix Problem

When a parent contains only floated children, it collapses:

### Solution: Clearfix
\`\`\`css
.clearfix::after {
    content: "";
    display: table;
    clear: both;
}
\`\`\`

Or use:
\`\`\`css
.parent {
    overflow: auto;
    /* or */
    display: flow-root;
}
\`\`\`

## Clear Property

Prevents elements from sitting next to floated elements:

\`\`\`css
.footer {
    clear: both;  /* left, right, or both */
}
\`\`\`

## Float Layout Example

\`\`\`css
.sidebar {
    float: left;
    width: 25%;
}

.main-content {
    float: left;
    width: 75%;
}

.container::after {
    content: "";
    display: table;
    clear: both;
}
\`\`\`

## Modern Alternatives

**Consider using instead:**
- **Flexbox** - For one-dimensional layouts
- **CSS Grid** - For two-dimensional layouts

These are easier to use and don't require clearfix hacks!

## When to Still Use Float

1. Text wrapping around images
2. Legacy browser support
3. Magazine-style layouts

## Pro Tips

1. Always use clearfix with floating layouts
2. Prefer Flexbox/Grid for new projects
3. Float is still useful for text wrapping
4. Set explicit widths on floated elements`
    },
    {
        title: "CSS Position",
        orderIndex: 7,
        xpReward: 15,
        content: `# CSS Position

## Controlling Element Placement

The \`position\` property controls how elements are positioned in the document.

## Position Values

### static (default)
\`\`\`css
.element {
    position: static;
}
\`\`\`
Elements flow normally. Top/left/right/bottom have no effect.

### relative
\`\`\`css
.element {
    position: relative;
    top: 10px;
    left: 20px;
}
\`\`\`
Moves relative to its normal position. Original space is preserved.

### absolute
\`\`\`css
.parent {
    position: relative; /* Creates positioning context */
}

.child {
    position: absolute;
    top: 0;
    right: 0;
}
\`\`\`
Removed from flow. Positioned relative to nearest positioned ancestor.

### fixed
\`\`\`css
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
}
\`\`\`
Stays in place during scroll. Positioned relative to viewport.

### sticky
\`\`\`css
.header {
    position: sticky;
    top: 0;
}
\`\`\`
Hybrid of relative and fixed. Sticks when scrolled to threshold.

## Offset Properties

| Property | Description |
|----------|-------------|
| top | Distance from top |
| right | Distance from right |
| bottom | Distance from bottom |
| left | Distance from left |

## Z-Index (Stacking)

Controls which element appears on top:

\`\`\`css
.back { z-index: 1; }
.middle { z-index: 2; }
.front { z-index: 3; }
\`\`\`

**Note:** Only works on positioned elements (not static)

## Real-World Examples

### Fixed Navigation
\`\`\`css
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: white;
}
\`\`\`

### Badge on Card
\`\`\`css
.card {
    position: relative;
}

.badge {
    position: absolute;
    top: -10px;
    right: -10px;
}
\`\`\`

### Centered Modal
\`\`\`css
.modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
\`\`\`

### Sticky Sidebar
\`\`\`css
.sidebar {
    position: sticky;
    top: 80px;  /* Below navbar */
}
\`\`\``
    },
    {
        title: "CSS Pseudo Classes",
        orderIndex: 8,
        xpReward: 15,
        content: `# CSS Pseudo Classes

## Styling Element States

Pseudo classes select elements based on their state or position, not just their type or class.

## Syntax

\`\`\`css
selector:pseudo-class {
    property: value;
}
\`\`\`

## User Action Pseudo Classes

### :hover
\`\`\`css
.btn:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
}
\`\`\`

### :active
\`\`\`css
.btn:active {
    transform: translateY(0);
}
\`\`\`

### :focus
\`\`\`css
input:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
}
\`\`\`

### :visited
\`\`\`css
a:visited {
    color: purple;
}
\`\`\`

## Structural Pseudo Classes

### :first-child / :last-child
\`\`\`css
li:first-child {
    border-top: none;
}

li:last-child {
    border-bottom: none;
}
\`\`\`

### :nth-child()
\`\`\`css
/* Odd rows */
tr:nth-child(odd) {
    background: #f9f9f9;
}

/* Every 3rd element */
li:nth-child(3n) {
    color: red;
}

/* First 3 elements */
li:nth-child(-n+3) {
    font-weight: bold;
}
\`\`\`

### :not()
\`\`\`css
p:not(.special) {
    color: gray;
}

input:not([type="submit"]) {
    border: 1px solid #ddd;
}
\`\`\`

## Form Pseudo Classes

\`\`\`css
input:required {
    border-left: 3px solid red;
}

input:valid {
    border-color: green;
}

input:invalid {
    border-color: red;
}

input:disabled {
    background: #eee;
    cursor: not-allowed;
}

input:checked + label {
    color: green;
}
\`\`\`

## Real-World Examples

### Interactive Button
\`\`\`css
.btn {
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn:active {
    transform: translateY(0);
}
\`\`\`

### Zebra Striped Table
\`\`\`css
tr:nth-child(even) {
    background-color: #f8f9fa;
}

tr:hover {
    background-color: #e9ecef;
}
\`\`\``
    },
    {
        title: "CSS Pseudo Elements",
        orderIndex: 9,
        xpReward: 15,
        content: `# CSS Pseudo Elements

## Creating Virtual Elements

Pseudo elements let you style specific parts of an element or create decorative content without extra HTML.

## Syntax

\`\`\`css
selector::pseudo-element {
    property: value;
}
\`\`\`

**Note:** Use double colons (::) for pseudo elements

## Common Pseudo Elements

### ::before and ::after
\`\`\`css
.quote::before {
    content: '"';
    font-size: 2em;
    color: #ccc;
}

.quote::after {
    content: '"';
    font-size: 2em;
    color: #ccc;
}
\`\`\`

**Important:** \`content\` property is required!

### ::first-letter
\`\`\`css
p::first-letter {
    font-size: 3em;
    float: left;
    line-height: 1;
    margin-right: 8px;
    color: #007bff;
}
\`\`\`

### ::first-line
\`\`\`css
p::first-line {
    font-weight: bold;
    color: #333;
}
\`\`\`

### ::selection
\`\`\`css
::selection {
    background-color: #007bff;
    color: white;
}
\`\`\`

### ::placeholder
\`\`\`css
input::placeholder {
    color: #aaa;
    font-style: italic;
}
\`\`\`

## Creative Uses

### Decorative Underlines
\`\`\`css
.fancy-link::after {
    content: '';
    display: block;
    width: 0;
    height: 2px;
    background: #007bff;
    transition: width 0.3s;
}

.fancy-link:hover::after {
    width: 100%;
}
\`\`\`

### Icons with Content
\`\`\`css
.email::before {
    content: '📧 ';
}

.required::after {
    content: ' *';
    color: red;
}
\`\`\`

### Quote Styling
\`\`\`css
blockquote::before {
    content: '❝';
    font-size: 4em;
    position: absolute;
    left: -20px;
    top: -20px;
    opacity: 0.2;
}
\`\`\`

### Tooltips
\`\`\`css
.tooltip {
    position: relative;
}

.tooltip::after {
    content: attr(data-tip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s;
}

.tooltip:hover::after {
    opacity: 1;
}
\`\`\`

## Key Differences

| Pseudo Class | Pseudo Element |
|--------------|----------------|
| Single colon (:) | Double colon (::) |
| Selects states | Creates content |
| :hover, :focus | ::before, ::after |`
    },
    {
        title: "CSS Shadows",
        orderIndex: 10,
        xpReward: 25,
        content: `# CSS Shadows

## Adding Depth with Shadows

Shadows create depth and hierarchy in your designs. CSS provides two shadow types: box-shadow and text-shadow.

## Box Shadow

\`\`\`css
/* box-shadow: h-offset v-offset blur spread color; */
.card {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
\`\`\`

### Parameters

| Parameter | Description |
|-----------|-------------|
| h-offset | Horizontal offset (+ right, - left) |
| v-offset | Vertical offset (+ down, - up) |
| blur | Blur radius (optional) |
| spread | Spread radius (optional) |
| color | Shadow color |
| inset | Inner shadow (optional) |

### Shadow Examples

\`\`\`css
/* Subtle elevation */
.subtle {
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}

/* Medium card shadow */
.card {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* Strong shadow */
.modal {
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

/* Inset shadow */
.input {
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}
\`\`\`

## Multiple Shadows

\`\`\`css
.layered {
    box-shadow: 
        0 1px 2px rgba(0,0,0,0.1),
        0 4px 8px rgba(0,0,0,0.1),
        0 8px 16px rgba(0,0,0,0.1);
}
\`\`\`

## Text Shadow

\`\`\`css
/* text-shadow: h-offset v-offset blur color; */
h1 {
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}
\`\`\`

### Text Shadow Examples

\`\`\`css
/* Subtle depth */
.heading {
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

/* Glow effect */
.neon {
    text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
}

/* Outline effect */
.outline {
    text-shadow:
        -1px -1px 0 #000,
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000;
}
\`\`\`

## Shadow Design System

\`\`\`css
:root {
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
    --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
}

.card { box-shadow: var(--shadow-md); }
.modal { box-shadow: var(--shadow-xl); }
\`\`\`

## Hover Effects

\`\`\`css
.card {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: box-shadow 0.3s ease;
}

.card:hover {
    box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}
\`\`\`

## Congratulations!

You've completed the CSS section! 🎉`
    }
];

async function seed() {
    console.log('🌱 Starting course seed...');

    // Create the course
    const course = await prisma.course.create({
        data: {
            title: 'Introduction to Software Development',
            description: 'Learn the fundamentals of web development starting from HTML, CSS, and JavaScript. This comprehensive course takes you from complete beginner to building your own interactive web pages.',
            difficulty: 'BEGINNER',
            durationHours: 15,
            thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800'
        }
    });

    console.log('✅ Created course:', course.title);

    // Create HTML Module
    const htmlModule = await prisma.module.create({
        data: {
            courseId: course.id,
            title: 'HTML Fundamentals',
            description: 'Learn the building blocks of every website',
            orderIndex: 1
        }
    });

    // Create CSS Module
    const cssModule = await prisma.module.create({
        data: {
            courseId: course.id,
            title: 'CSS Styling',
            description: 'Make your websites beautiful with CSS',
            orderIndex: 2
        }
    });

    console.log('✅ Created modules');

    // Create HTML Lessons
    for (const lesson of htmlLessons) {
        await prisma.lesson.create({
            data: {
                moduleId: htmlModule.id,
                ...lesson,
                readingTimeMinutes: 10
            }
        });
    }

    console.log('✅ Created 10 HTML lessons');

    // Create CSS Lessons
    for (const lesson of cssLessons) {
        await prisma.lesson.create({
            data: {
                moduleId: cssModule.id,
                ...lesson,
                readingTimeMinutes: 10
            }
        });
    }

    console.log('✅ Created 10 CSS lessons');
    console.log('🎉 Course seed completed!');
}

seed()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
