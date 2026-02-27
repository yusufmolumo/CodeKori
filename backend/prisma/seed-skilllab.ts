import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const modes = [
    {
        slug: 'bug-hunter',
        title: 'Bug Hunter',
        description: 'Fix broken code using limited hints. Inspect variables, set breakpoints, and submit your fix to earn XP.',
        icon: 'Bug',
        orderIndex: 1,
    },
    {
        slug: 'system-architect',
        title: 'System Architect',
        description: 'Design scalable systems by choosing the right components. Simulate traffic and optimize for performance.',
        icon: 'Network',
        orderIndex: 2,
    },
    {
        slug: 'algorithm-arena',
        title: 'Algorithm Arena',
        description: 'Write algorithms, visualize them step-by-step, and optimize for speed and efficiency.',
        icon: 'Cpu',
        orderIndex: 3,
    },
    {
        slug: 'code-quest',
        title: 'Code Quest',
        description: 'Embark on branching quests where your decisions shape difficulty, points, and the next challenge.',
        icon: 'Map',
        orderIndex: 4,
    },
    {
        slug: 'challenge-arena',
        title: 'Challenge Arena',
        description: 'Upload your notes and face auto-generated timed challenges and problem-solving mini tasks.',
        icon: 'Timer',
        orderIndex: 5,
    },
    {
        slug: 'dev-simulator',
        title: 'Dev Simulator',
        description: 'Enter simulated real-world missions: debug production code, read error logs, and ship fixes.',
        icon: 'Terminal',
        orderIndex: 6,
    },
];

// ---- Bug Hunter Tasks (20) ----
const bugHunterTasks = [
    { title: 'Off-by-One Loop', description: 'A for-loop prints one too many elements.', scenario: 'Bug Report: The array [1,2,3] prints 4 items including "undefined". Expected: print only 3 items.\n\nCode:\nconst arr = [1,2,3];\nfor(let i = 0; i <= arr.length; i++) {\n  console.log(arr[i]);\n}', difficulty: 'EASY', xpReward: 30, taskData: { correctAnswer: 'i < arr.length', expectedKeywords: ['i < arr.length', '< arr.length'] } },
    { title: 'Missing Return', description: 'Function runs but always returns undefined.', scenario: 'Bug Report: getSum(2,3) returns undefined instead of 5.\n\nCode:\nfunction getSum(a, b) {\n  const sum = a + b;\n}', difficulty: 'EASY', xpReward: 30, taskData: { correctAnswer: 'return sum', expectedKeywords: ['return', 'a + b'] } },
    { title: 'String vs Number', description: 'Calculator concatenates instead of adding.', scenario: 'Bug Report: addNumbers("5","3") returns "53" instead of 8.\n\nCode:\nfunction addNumbers(a, b) {\n  return a + b;\n}', difficulty: 'EASY', xpReward: 30, taskData: { expectedKeywords: ['parseInt', 'Number', 'parseFloat', '+a', '+b'] } },
    { title: 'Scope Confusion', description: 'Variable is not accessible outside block.', scenario: 'Bug Report: The code throws ReferenceError for "result".\n\nCode:\nif (true) {\n  let result = 42;\n}\nconsole.log(result);', difficulty: 'EASY', xpReward: 30, taskData: { expectedKeywords: ['let result', 'var result', 'outside', 'before'] } },
    { title: 'Async Ordering', description: 'Console logs appear in wrong order.', scenario: 'Bug Report: Expected output "A, B, C" but got "A, C, B".\n\nCode:\nconsole.log("A");\nsetTimeout(() => console.log("B"), 0);\nconsole.log("C");', difficulty: 'MEDIUM', xpReward: 50, taskData: { expectedKeywords: ['event loop', 'async', 'setTimeout', 'callback queue', 'microtask'] } },
    { title: 'Array Mutation', description: 'Original array is being modified unexpectedly.', scenario: 'Bug Report: After calling sortArr, the original array is also sorted.\n\nCode:\nconst original = [3, 1, 2];\nconst sorted = original.sort();\nconsole.log(original);', difficulty: 'MEDIUM', xpReward: 50, taskData: { expectedKeywords: ['slice', 'spread', '[...original]', 'Array.from', 'toSorted'] } },
    { title: 'Equality Check', description: 'Condition always evaluates true.', scenario: 'Bug Report: This always prints "equal" even for different values.\n\nCode:\nif (0 == false) {\n  console.log("equal");\n}', difficulty: 'EASY', xpReward: 30, taskData: { expectedKeywords: ['===', 'strict equality', 'triple equals', 'type coercion'] } },
    { title: 'this Keyword', description: 'Object method loses context.', scenario: 'Bug Report: button.onClick() works, but passing it to setTimeout prints undefined.\n\nCode:\nconst button = {\n  label: "Submit",\n  onClick: function() {\n    console.log(this.label);\n  }\n};\nsetTimeout(button.onClick, 100);', difficulty: 'MEDIUM', xpReward: 50, taskData: { expectedKeywords: ['bind', 'arrow function', '() =>', '.bind(button)'] } },
    { title: 'Null Reference', description: 'Code crashes when user has no address.', scenario: 'Bug Report: TypeError: Cannot read property "city" of undefined.\n\nCode:\nconst user = { name: "Alice" };\nconsole.log(user.address.city);', difficulty: 'EASY', xpReward: 30, taskData: { expectedKeywords: ['optional chaining', '?.', 'user.address?.city', 'if (user.address)'] } },
    { title: 'Floating Point', description: 'Price calculation is slightly wrong.', scenario: 'Bug Report: 0.1 + 0.2 shows 0.30000000000000004 instead of 0.3.\n\nCode:\nconst total = 0.1 + 0.2;\nif (total === 0.3) console.log("Match");', difficulty: 'MEDIUM', xpReward: 50, taskData: { expectedKeywords: ['toFixed', 'Math.round', 'epsilon', 'multiply', '* 100'] } },
    { title: 'Event Listener Leak', description: 'Click handler fires multiple times.', scenario: 'Bug Report: Each time the modal opens, the submit button adds another event listener, causing duplicate requests.\n\nCode:\nfunction openModal() {\n  modal.style.display = "block";\n  submitBtn.addEventListener("click", handleSubmit);\n}', difficulty: 'MEDIUM', xpReward: 50, taskData: { expectedKeywords: ['removeEventListener', 'once', 'AbortController', 'remove'] } },
    { title: 'Race Condition', description: 'API data shows stale results.', scenario: 'Bug Report: Rapid typing in search bar shows results from previous queries.\n\nCode:\nasync function search(query) {\n  const res = await fetch("/api/search?q=" + query);\n  const data = await res.json();\n  renderResults(data);\n}', difficulty: 'HARD', xpReward: 75, taskData: { expectedKeywords: ['AbortController', 'abort', 'cancel', 'debounce', 'latest'] } },
    { title: 'Promise Rejection', description: 'Unhandled promise rejection crashes the app.', scenario: 'Bug Report: App crashes with "UnhandledPromiseRejection" when API is down.\n\nCode:\nasync function fetchUser(id) {\n  const res = await fetch(`/api/users/${id}`);\n  const data = await res.json();\n  return data;\n}', difficulty: 'MEDIUM', xpReward: 50, taskData: { expectedKeywords: ['try', 'catch', '.catch', 'error handling'] } },
    { title: 'Infinite Loop', description: 'Browser tab freezes on page load.', scenario: 'Bug Report: Page becomes unresponsive.\n\nCode:\nlet i = 10;\nwhile (i > 0) {\n  console.log(i);\n  i++;\n}', difficulty: 'EASY', xpReward: 30, taskData: { correctAnswer: 'i--', expectedKeywords: ['i--', 'decrement', 'i -= 1'] } },
    { title: 'Closure Trap', description: 'Loop variables all share the same final value.', scenario: 'Bug Report: All buttons alert "5" instead of 0,1,2,3,4.\n\nCode:\nfor (var i = 0; i < 5; i++) {\n  buttons[i].onclick = function() { alert(i); };\n}', difficulty: 'HARD', xpReward: 75, taskData: { expectedKeywords: ['let', 'closure', 'IIFE', 'block scope'] } },
    { title: 'JSON Parse Error', description: 'API response fails to parse.', scenario: 'Bug Report: SyntaxError: Unexpected token.\n\nCode:\nconst data = JSON.parse("{name: Alice}");\nconsole.log(data.name);', difficulty: 'EASY', xpReward: 30, taskData: { expectedKeywords: ['"name"', 'double quotes', 'valid JSON', '"Alice"'] } },
    { title: 'CSS Class Toggle', description: 'Toggle only adds class, never removes it.', scenario: 'Bug Report: Dark mode button only activates dark mode, clicking again does nothing.\n\nCode:\nbtn.addEventListener("click", () => {\n  body.className = "dark-mode";\n});', difficulty: 'EASY', xpReward: 30, taskData: { expectedKeywords: ['classList.toggle', 'toggle', 'classList'] } },
    { title: 'Debounce Missing', description: 'Search API called on every keystroke.', scenario: 'Bug Report: Typing "hello" fires 5 API requests instead of 1.\n\nCode:\ninput.addEventListener("input", (e) => {\n  fetch(`/api/search?q=${e.target.value}`);\n});', difficulty: 'MEDIUM', xpReward: 50, taskData: { expectedKeywords: ['debounce', 'setTimeout', 'clearTimeout', 'delay'] } },
    { title: 'Map Key Error', description: 'React list renders incorrectly after deletion.', scenario: 'Bug Report: Deleting item 2 from a list causes item 3 to disappear visually.\n\nCode:\nitems.map((item, index) => (\n  <li key={index}>{item.name}</li>\n));', difficulty: 'MEDIUM', xpReward: 50, taskData: { expectedKeywords: ['key={item.id}', 'unique key', 'stable key', 'item.id'] } },
    { title: 'Memory Leak', description: 'App slows down over time with intervals.', scenario: 'Bug Report: Dashboard becomes slower over hours. Multiple intervals are running.\n\nCode:\nuseEffect(() => {\n  setInterval(() => fetchData(), 5000);\n}, []);', difficulty: 'HARD', xpReward: 75, taskData: { expectedKeywords: ['clearInterval', 'cleanup', 'return () =>', 'useEffect cleanup'] } },
];

// ---- System Architect Tasks (20) ----
const systemArchitectTasks = [
    { title: 'Design a URL Shortener', description: 'Design a system like bit.ly.', scenario: 'Requirement: Build a URL shortening service. It should generate short URLs, redirect to originals, and track click counts.\n\nWhich components do you need?\nA) Web Server + Database\nB) Web Server + Database + Cache\nC) Web Server + Database + Cache + Load Balancer\nD) Just a Web Server', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'C' } },
    { title: 'Chat Application', description: 'Design real-time messaging.', scenario: 'Requirement: Build a real-time chat app like WhatsApp Web.\n\nWhat protocol is best for real-time messaging?\nA) HTTP Polling\nB) WebSockets\nC) FTP\nD) SMTP', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'B' } },
    { title: 'Social Media Feed', description: 'Design Twitter/X feed system.', scenario: 'Requirement: Design the home feed for a social platform. Users follow others and see recent posts.\n\nBest approach for feed generation?\nA) Fan-out on write (push model)\nB) Fan-out on read (pull model)\nC) Hybrid approach\nD) No caching needed', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'C' } },
    { title: 'E-Commerce Cart', description: 'Design a shopping cart system.', scenario: 'Requirement: Shopping cart that persists across sessions.\n\nBest storage strategy?\nA) LocalStorage only\nB) Database only\nC) Session + Database sync\nD) Cookies only', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'C' } },
    { title: 'File Upload Service', description: 'Handle large file uploads.', scenario: 'Requirement: Users upload files up to 5GB.\n\nBest approach?\nA) Single HTTP POST\nB) Chunked uploads with resume\nC) Base64 encoding in JSON\nD) FTP connection', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Notification System', description: 'Design multi-channel notifications.', scenario: 'Requirement: Send push, email, and SMS notifications.\n\nBest architecture pattern?\nA) Direct API calls from main server\nB) Message queue with worker consumers\nC) Synchronous processing\nD) Cron job batch processing', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Rate Limiter', description: 'Protect API from abuse.', scenario: 'Requirement: Limit each user to 100 requests per minute.\n\nBest algorithm?\nA) Fixed window counter\nB) Sliding window log\nC) Token bucket\nD) All are valid, choose based on needs', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'D' } },
    { title: 'Search Engine', description: 'Design full-text search.', scenario: 'Requirement: Search across millions of documents.\n\nBest technology choice?\nA) SQL LIKE queries\nB) Elasticsearch / Inverted Index\nC) Linear scan\nD) Binary search on sorted files', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Video Streaming', description: 'Design a video platform.', scenario: 'Requirement: Stream video content to millions of users.\n\nKey component for global delivery?\nA) Single powerful server\nB) CDN (Content Delivery Network)\nC) P2P only\nD) Database storage', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'B' } },
    { title: 'Authentication Service', description: 'Design secure auth system.', scenario: 'Requirement: Secure login with session management.\n\nBest token strategy for stateless auth?\nA) Session cookies only\nB) JWT with refresh tokens\nC) API keys\nD) Basic auth header', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'B' } },
    { title: 'Database Sharding', description: 'Scale database horizontally.', scenario: 'Requirement: Database has 100M rows and growing. Reads are slow.\n\nBest first step?\nA) Add indexes and read replicas\nB) Immediately shard\nC) Move to NoSQL\nD) Delete old data', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'A' } },
    { title: 'Payment Processing', description: 'Handle payments securely.', scenario: 'Requirement: Process credit card payments.\n\nMost important principle?\nA) Store card numbers encrypted\nB) Use a PCI-compliant payment gateway\nC) Process everything client-side\nD) Log all card numbers for debugging', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'B' } },
    { title: 'Microservices Gateway', description: 'Route traffic to services.', scenario: 'Requirement: 10 microservices need a single entry point.\n\nBest choice?\nA) API Gateway\nB) Direct client-to-service calls\nC) Shared database\nD) Monolith wrapper', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'A' } },
    { title: 'Job Queue System', description: 'Process background tasks.', scenario: 'Requirement: Send welcome emails async after registration.\n\nBest approach?\nA) Send email in the request handler\nB) Use a message queue (Redis/RabbitMQ)\nC) Use a cron job every minute\nD) Client-side API call', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Load Balancer Config', description: 'Distribute traffic evenly.', scenario: 'Requirement: 4 app servers, some requests are CPU-heavy.\n\nBest LB algorithm?\nA) Round Robin\nB) Least Connections\nC) Random\nD) IP Hash', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Caching Strategy', description: 'Reduce database load.', scenario: 'Requirement: Product pages are read-heavy, updated rarely.\n\nBest caching pattern?\nA) Write-through cache\nB) Cache-aside (lazy loading)\nC) Write-behind cache\nD) No caching needed', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Log Aggregation', description: 'Centralize logs from many servers.', scenario: 'Requirement: 50 servers generating logs. Need centralized search.\n\nBest stack?\nA) grep on each server\nB) ELK Stack (Elasticsearch, Logstash, Kibana)\nC) Save to single file\nD) Print to console', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'CI/CD Pipeline', description: 'Automate deployment.', scenario: 'Requirement: Deploy code changes safely and automatically.\n\nCorrect pipeline order?\nA) Deploy → Test → Build\nB) Build → Test → Deploy\nC) Test → Deploy → Build\nD) Deploy → Build → Test', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'B' } },
    { title: 'Data Replication', description: 'Ensure data availability.', scenario: 'Requirement: Database must survive server failure.\n\nBest replication strategy?\nA) Single server with backups\nB) Primary-Replica replication\nC) No replication needed\nD) Copy data to spreadsheets', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'B' } },
    { title: 'API Versioning', description: 'Handle API evolution.', scenario: 'Requirement: Release API v2 without breaking v1 clients.\n\nBest versioning approach?\nA) URL path versioning (/api/v1, /api/v2)\nB) Break all old clients\nC) Never change the API\nD) Use different ports', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'A' } },
];

// ---- Algorithm Arena Tasks (20) ----
const algorithmArenaTasks = [
    { title: 'Bubble Sort', description: 'Sort an array using bubble sort.', scenario: 'Problem: Sort the array [5, 3, 8, 1, 9, 2] in ascending order using bubble sort.\n\nWrite the sorted result.', difficulty: 'EASY', xpReward: 30, taskData: { correctAnswer: '1,2,3,5,8,9', expectedKeywords: ['1', '2', '3', '5', '8', '9'] } },
    { title: 'Binary Search', description: 'Find an element in a sorted array.', scenario: 'Problem: Find the index of 7 in [1, 3, 5, 7, 9, 11]. Use binary search logic.\n\nWhat index is 7 at?', difficulty: 'EASY', xpReward: 30, taskData: { correctAnswer: '3' } },
    { title: 'Reverse a String', description: 'Reverse a string without built-in methods.', scenario: 'Problem: Reverse the string "hello world" without using .reverse().\n\nWhat is the result?', difficulty: 'EASY', xpReward: 30, taskData: { correctAnswer: 'dlrow olleh' } },
    { title: 'FizzBuzz', description: 'Classic FizzBuzz challenge.', scenario: 'Problem: For numbers 1-15, print "Fizz" for multiples of 3, "Buzz" for 5, "FizzBuzz" for both.\n\nWhat prints for number 15?', difficulty: 'EASY', xpReward: 30, taskData: { correctAnswer: 'FizzBuzz' } },
    { title: 'Two Sum', description: 'Find two numbers that add to target.', scenario: 'Problem: Given [2, 7, 11, 15] and target 9, find the two indices.\n\nWhat are the indices?', difficulty: 'EASY', xpReward: 40, taskData: { correctAnswer: '0,1', expectedKeywords: ['0', '1'] } },
    { title: 'Palindrome Check', description: 'Check if a string is a palindrome.', scenario: 'Problem: Is "racecar" a palindrome?\n\nAnswer yes or no.', difficulty: 'EASY', xpReward: 30, taskData: { correctAnswer: 'yes' } },
    { title: 'Find Maximum', description: 'Find the largest element.', scenario: 'Problem: Find the maximum value in [34, 12, 78, 56, 23, 89, 45] without Math.max.\n\nWhat is the maximum?', difficulty: 'EASY', xpReward: 30, taskData: { correctAnswer: '89' } },
    { title: 'Remove Duplicates', description: 'Remove duplicates from an array.', scenario: 'Problem: Remove duplicates from [1, 2, 2, 3, 4, 4, 5].\n\nWhat is the result array?', difficulty: 'EASY', xpReward: 30, taskData: { correctAnswer: '1,2,3,4,5' } },
    { title: 'Fibonacci Sequence', description: 'Generate Fibonacci numbers.', scenario: 'Problem: Generate the first 8 Fibonacci numbers starting from 0.\n\nList them comma-separated.', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctAnswer: '0,1,1,2,3,5,8,13' } },
    { title: 'Merge Sorted Arrays', description: 'Merge two sorted arrays.', scenario: 'Problem: Merge [1, 3, 5] and [2, 4, 6] into a single sorted array.\n\nWhat is the result?', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctAnswer: '1,2,3,4,5,6' } },
    { title: 'Count Vowels', description: 'Count vowels in a string.', scenario: 'Problem: Count the number of vowels in "programming is awesome".\n\nHow many vowels?', difficulty: 'EASY', xpReward: 30, taskData: { correctAnswer: '8' } },
    { title: 'Anagram Check', description: 'Check if two strings are anagrams.', scenario: 'Problem: Are "listen" and "silent" anagrams of each other?\n\nAnswer yes or no.', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctAnswer: 'yes' } },
    { title: 'Selection Sort', description: 'Sort using selection sort.', scenario: 'Problem: Sort [64, 25, 12, 22, 11] using selection sort.\n\nIn the first pass, which element gets placed first?', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctAnswer: '11' } },
    { title: 'Stack Implementation', description: 'Implement a basic stack.', scenario: 'Problem: After push(1), push(2), push(3), pop(), what is the top of the stack?\n\nWhat value?', difficulty: 'EASY', xpReward: 30, taskData: { correctAnswer: '2' } },
    { title: 'Queue Implementation', description: 'Implement a basic queue.', scenario: 'Problem: After enqueue(A), enqueue(B), enqueue(C), dequeue(), what is the front?\n\nWhat value?', difficulty: 'EASY', xpReward: 30, taskData: { correctAnswer: 'B' } },
    { title: 'Recursion Factorial', description: 'Calculate factorial recursively.', scenario: 'Problem: What is 6! (6 factorial) calculated recursively?\n\nWhat is the answer?', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctAnswer: '720' } },
    { title: 'Matrix Diagonal Sum', description: 'Sum the diagonal of a matrix.', scenario: 'Problem: Sum the primary diagonal of:\n[[1,2,3],[4,5,6],[7,8,9]]\n\nWhat is the sum?', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctAnswer: '15' } },
    { title: 'Linked List Cycle', description: 'Detect a cycle in a linked list.', scenario: 'Problem: Which algorithm detects cycles in O(1) space?\n\nA) Hash Set\nB) Floyd\'s Tortoise and Hare\nC) Brute Force\nD) Stack', difficulty: 'HARD', xpReward: 75, taskData: { correctOption: 'B' } },
    { title: 'Binary Tree Traversal', description: 'Traverse a binary tree in-order.', scenario: 'Problem: In-order traversal of:\n     4\n    / \\\n   2   6\n  / \\ / \\\n 1  3 5  7\n\nWhat is the result?', difficulty: 'HARD', xpReward: 75, taskData: { correctAnswer: '1,2,3,4,5,6,7' } },
    { title: 'Quick Sort Partition', description: 'Understand quicksort partitioning.', scenario: 'Problem: Using last element as pivot, partition [10, 80, 30, 90, 40, 50, 70]. Pivot is 70.\n\nHow many elements end up before the pivot?', difficulty: 'HARD', xpReward: 75, taskData: { correctAnswer: '4' } },
];

// ---- Code Quest Tasks (20) ----
const codeQuestTasks = [
    { title: 'Startup Landing Page', description: 'Client wants fast loading speed.', scenario: 'Quest: You are hired to design a landing page for a startup. The client wants fast loading speed.\n\nWhich approach do you choose?\nA) Add heavy animations and 4K images\nB) Optimize images, lazy load, minimal JS\nC) Use a heavyweight framework with SSR\nD) Write everything inline in one HTML file', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'B' } },
    { title: 'Database Selection', description: 'Choose the right database for a social app.', scenario: 'Quest: You\'re building a social network. Users have complex relationships (friends, followers, groups).\n\nBest database choice?\nA) MySQL (relational)\nB) MongoDB (document)\nC) Neo4j (graph)\nD) Redis (key-value)', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'C' } },
    { title: 'Security First', description: 'A client asks you to store passwords.', scenario: 'Quest: Your client says "Just store passwords in plain text, it\'s faster."\n\nWhat do you do?\nA) Agree with the client\nB) Use bcrypt hashing with salt\nC) Use Base64 encoding\nD) Use MD5 hashing', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'B' } },
    { title: 'Mobile-First Design', description: 'Build a responsive web app.', scenario: 'Quest: The app has 70% mobile users but was designed desktop-first.\n\nBest redesign approach?\nA) Just add media queries at the end\nB) Rebuild with mobile-first CSS approach\nC) Create a separate mobile site\nD) Block mobile users', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'B' } },
    { title: 'API Rate Limiting', description: 'Your API is being abused.', scenario: 'Quest: Your free-tier API is getting 10,000 req/sec from one user.\n\nImmediate action?\nA) Shut down the API\nB) Implement rate limiting per API key\nC) Increase server capacity\nD) Ignore it', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Tech Stack Decision', description: 'Choose tech for a real-time dashboard.', scenario: 'Quest: Build a real-time analytics dashboard with live updating charts.\n\nBest frontend choice?\nA) Static HTML with manual refresh\nB) React with WebSocket connections\nC) jQuery with polling every 30s\nD) Vanilla JS with iframes', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Deployment Strategy', description: 'Deploy without downtime.', scenario: 'Quest: Production app serves 10K users. Need to deploy new version.\n\nBest strategy?\nA) Take site down, deploy, bring back up\nB) Blue-green deployment\nC) Deploy directly to production\nD) Ask users to clear cache', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Error Handling', description: 'User-facing errors need improvement.', scenario: 'Quest: Users see "Error: ECONNREFUSED 127.0.0.1:5432" on screen.\n\nHow to fix?\nA) Show technical error to help users debug\nB) Catch errors and show user-friendly messages\nC) Hide all errors silently\nD) Redirect to Google', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'B' } },
    { title: 'Code Review Feedback', description: 'Review a junior developer\'s PR.', scenario: 'Quest: Junior dev submits a PR with console.log everywhere, no error handling, and hardcoded API keys.\n\nPriority feedback?\nA) "Remove all console.logs"\nB) "Move API keys to environment variables immediately"\nC) "Add comments"\nD) "Change variable names"', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'B' } },
    { title: 'Scalability Planning', description: 'App grown from 100 to 100K users.', scenario: 'Quest: Your app now has 100K users. Database queries are slow.\n\nFirst optimization?\nA) Rewrite in a faster language\nB) Add database indexes and query optimization\nC) Buy more expensive servers\nD) Delete old user accounts', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Testing Strategy', description: 'No tests exist in the project.', scenario: 'Quest: Large codebase with zero tests. Where to start?\n\nA) Write unit tests for every function immediately\nB) Start with integration tests for critical paths\nC) Skip testing, ship fast\nD) Only test the UI manually', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Accessibility Audit', description: 'App fails accessibility review.', scenario: 'Quest: Screen readers can\'t navigate your app. Images have no alt text.\n\nFirst fix?\nA) Add aria labels and alt text\nB) Remove images\nC) Tell users to use a different app\nD) Add more colors', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'A' } },
    { title: 'Data Privacy', description: 'GDPR compliance request.', scenario: 'Quest: European users request their data be deleted.\n\nCorrect response?\nA) Ignore the request\nB) Implement data deletion endpoint and comply within 30 days\nC) Delete their account but keep data\nD) Block European users', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Monolith to Microservices', description: 'App is too big to manage.', scenario: 'Quest: Monolith has 500K lines, deploys take 2 hours.\n\nBest migration approach?\nA) Rewrite everything at once\nB) Strangler fig pattern - gradually extract services\nC) Add more developers\nD) Split randomly into services', difficulty: 'HARD', xpReward: 75, taskData: { correctOption: 'B' } },
    { title: 'Incident Response', description: 'Production is down!', scenario: 'Quest: 3am alert: production is down. Users can\'t login.\n\nFirst step?\nA) Go back to sleep\nB) Check error logs and monitoring dashboards\nC) Immediately start coding a fix\nD) Email the CEO', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'B' } },
    { title: 'State Management', description: 'React app has prop drilling everywhere.', scenario: 'Quest: Props are passed through 8 levels of components.\n\nBest solution?\nA) Keep passing props\nB) Use Context API or state management library\nC) Make everything a global variable\nD) Store in localStorage', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Performance Optimization', description: 'Page loads in 8 seconds.', scenario: 'Quest: Lighthouse score is 35. Bundle size is 5MB.\n\nHighest impact fix?\nA) Change fonts\nB) Code splitting and lazy loading\nC) Add more features\nD) Switch hosting provider', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Git Branching', description: 'Team has merge conflicts daily.', scenario: 'Quest: 5 devs all working on main branch, constant conflicts.\n\nBest workflow?\nA) Everyone pushes to main\nB) GitFlow with feature branches and PRs\nC) Each dev has their own repo\nD) Don\'t use version control', difficulty: 'EASY', xpReward: 40, taskData: { correctOption: 'B' } },
    { title: 'Documentation Debt', description: 'No one knows how the API works.', scenario: 'Quest: New developer joins, no API docs exist.\n\nBest approach?\nA) Tell them to read the code\nB) Generate OpenAPI/Swagger docs from code\nC) Write a single Word document\nD) Record a 4-hour video', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
    { title: 'Feature Flags', description: 'Release features to subset of users.', scenario: 'Quest: Want to test new checkout flow with 10% of users.\n\nBest approach?\nA) Deploy two versions of the site\nB) Use feature flags with gradual rollout\nC) Ask users to opt-in manually\nD) A/B test with different URLs', difficulty: 'MEDIUM', xpReward: 60, taskData: { correctOption: 'B' } },
];

// ---- Challenge Arena Tasks (20) ----
const challengeArenaTasks = [
    { title: 'Variable Types Quiz', description: 'Identify JavaScript data types.', scenario: 'Timed Challenge: What is the type of null in JavaScript?\n\nA) null\nB) undefined\nC) object\nD) number', difficulty: 'EASY', xpReward: 30, taskData: { correctOption: 'C' } },
    { title: 'CSS Specificity', description: 'Which selector wins?', scenario: 'Timed Challenge: Which has highest specificity?\n\nA) .class\nB) #id\nC) element\nD) *', difficulty: 'EASY', xpReward: 30, taskData: { correctOption: 'B' } },
    { title: 'HTTP Status Codes', description: 'Match status to meaning.', scenario: 'Timed Challenge: What does HTTP 403 mean?\n\nA) Not Found\nB) Forbidden\nC) Server Error\nD) Redirect', difficulty: 'EASY', xpReward: 30, taskData: { correctOption: 'B' } },
    { title: 'Array Methods', description: 'Predict array method output.', scenario: 'Timed Challenge: [1,2,3].map(x => x * 2) returns?\n\nA) [1,2,3]\nB) [2,4,6]\nC) 6\nD) [1,4,9]', difficulty: 'EASY', xpReward: 30, taskData: { correctOption: 'B' } },
    { title: 'Promise Output', description: 'Predict async code output.', scenario: 'Timed Challenge: What logs first?\nconsole.log("A");\nPromise.resolve().then(() => console.log("B"));\nconsole.log("C");\n\nA) A, B, C\nB) A, C, B\nC) B, A, C\nD) C, A, B', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctOption: 'B' } },
    { title: 'SQL Join Types', description: 'Understand SQL joins.', scenario: 'Timed Challenge: Which join returns ALL rows from the left table?\n\nA) INNER JOIN\nB) LEFT JOIN\nC) RIGHT JOIN\nD) CROSS JOIN', difficulty: 'EASY', xpReward: 30, taskData: { correctOption: 'B' } },
    { title: 'Git Commands', description: 'Right command for the job.', scenario: 'Timed Challenge: You want to undo the last commit but keep changes staged.\n\nA) git reset --hard HEAD~1\nB) git reset --soft HEAD~1\nC) git revert HEAD\nD) git checkout HEAD~1', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctOption: 'B' } },
    { title: 'React Hooks', description: 'Choose the right hook.', scenario: 'Timed Challenge: Which hook runs side effects after render?\n\nA) useState\nB) useEffect\nC) useMemo\nD) useRef', difficulty: 'EASY', xpReward: 30, taskData: { correctOption: 'B' } },
    { title: 'Big O Notation', description: 'Identify time complexity.', scenario: 'Timed Challenge: What is the time complexity of binary search?\n\nA) O(n)\nB) O(n²)\nC) O(log n)\nD) O(1)', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctOption: 'C' } },
    { title: 'REST Conventions', description: 'Pick the RESTful endpoint.', scenario: 'Timed Challenge: Correct endpoint to get user #5?\n\nA) GET /getUser/5\nB) GET /users/5\nC) POST /users/get/5\nD) GET /user?id=5', difficulty: 'EASY', xpReward: 30, taskData: { correctOption: 'B' } },
    { title: 'CSS Flexbox', description: 'Center content with flexbox.', scenario: 'Timed Challenge: Center both horizontally and vertically?\n\nA) display:flex; justify-content:center; align-items:center\nB) display:flex; text-align:center\nC) display:block; margin:auto\nD) float:center', difficulty: 'EASY', xpReward: 30, taskData: { correctOption: 'A' } },
    { title: 'TypeScript Generics', description: 'Understand generic types.', scenario: 'Timed Challenge: What does Array<string> mean?\n\nA) Array of any type\nB) Array of strings only\nC) Array method called string\nD) String converted to array', difficulty: 'EASY', xpReward: 30, taskData: { correctOption: 'B' } },
    { title: 'Docker Basics', description: 'Container vs VM.', scenario: 'Timed Challenge: Key advantage of containers over VMs?\n\nA) More secure\nB) Lighter weight, share host OS kernel\nC) Faster network\nD) Larger storage', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctOption: 'B' } },
    { title: 'Environment Variables', description: 'Secure configuration.', scenario: 'Timed Challenge: Where should you store API keys?\n\nA) Hardcoded in source code\nB) In .env files (not committed to git)\nC) In HTML comments\nD) In the README', difficulty: 'EASY', xpReward: 30, taskData: { correctOption: 'B' } },
    { title: 'Event Bubbling', description: 'Understand event propagation.', scenario: 'Timed Challenge: If you click a button inside a div, which fires first?\n\nA) div handler\nB) button handler\nC) window handler\nD) body handler', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctOption: 'B' } },
    { title: 'Closure Concept', description: 'What is a closure?', scenario: 'Timed Challenge: A closure is:\n\nA) A function that has access to its outer scope variables\nB) A way to close a browser tab\nC) A type of loop\nD) A CSS property', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctOption: 'A' } },
    { title: 'Semantic HTML', description: 'Choose semantic elements.', scenario: 'Timed Challenge: Best element for main navigation?\n\nA) <div class="nav">\nB) <nav>\nC) <span id="navigation">\nD) <menu>', difficulty: 'EASY', xpReward: 30, taskData: { correctOption: 'B' } },
    { title: 'npm vs npx', description: 'Understand package runners.', scenario: 'Timed Challenge: What does npx do differently from npm?\n\nA) Installs packages globally\nB) Executes package binaries without installing globally\nC) Uninstalls packages\nD) Updates Node.js', difficulty: 'EASY', xpReward: 30, taskData: { correctOption: 'B' } },
    { title: 'CORS Explained', description: 'Cross-Origin Resource Sharing.', scenario: 'Timed Challenge: CORS error occurs when:\n\nA) Server is down\nB) Frontend requests a different origin without server permission\nC) JavaScript is disabled\nD) Cache is full', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctOption: 'B' } },
    { title: 'Responsive Breakpoints', description: 'Mobile-first media queries.', scenario: 'Timed Challenge: In mobile-first CSS, which is correct?\n\nA) @media (max-width: 768px)\nB) @media (min-width: 768px)\nC) @media (width: 768px)\nD) @media (device: mobile)', difficulty: 'MEDIUM', xpReward: 50, taskData: { correctOption: 'B' } },
];

// ---- Dev Simulator Tasks (20) ----
const devSimulatorTasks = [
    { title: 'Login System Failing', description: 'Debug a fintech login system.', scenario: 'Mission: You are a junior developer at a fintech startup. The login system is failing.\n\nError Log: "bcrypt.compare: data and hash arguments required"\n\nCode snippet:\nasync function login(email, password) {\n  const user = await db.findUser(email);\n  const match = await bcrypt.compare(password);\n  return match;\n}\n\nWhat is the bug?', difficulty: 'EASY', xpReward: 40, taskData: { expectedKeywords: ['user.passwordHash', 'hash', 'second argument', 'bcrypt.compare(password, user'] } },
    { title: 'Broken Checkout Flow', description: 'E-commerce checkout returns 500.', scenario: 'Mission: Customers report checkout fails with "Internal Server Error".\n\nError: "Cannot read property \'id\' of undefined"\n\nCode:\nconst order = await createOrder(cart.items);\nawait chargeCard(order.id, user.paymentMethod.id);\n\nWhat could be null/undefined?', difficulty: 'MEDIUM', xpReward: 60, taskData: { expectedKeywords: ['paymentMethod', 'user.paymentMethod', 'null check', 'optional chaining', 'undefined'] } },
    { title: 'Memory Leak in Dashboard', description: 'Dashboard slows down over time.', scenario: 'Mission: The admin dashboard becomes sluggish after 30 minutes.\n\nCode:\nuseEffect(() => {\n  const interval = setInterval(fetchStats, 3000);\n}, []);\n\nWhat is missing?', difficulty: 'MEDIUM', xpReward: 60, taskData: { expectedKeywords: ['clearInterval', 'cleanup', 'return', 'unmount'] } },
    { title: 'CORS Blocking API', description: 'Frontend cannot reach backend.', scenario: 'Mission: React app on port 3000 cannot call Express API on port 5000.\n\nError: "Access to fetch blocked by CORS policy"\n\nWhat needs to be added to the Express server?', difficulty: 'EASY', xpReward: 40, taskData: { expectedKeywords: ['cors', 'middleware', 'app.use(cors', 'origin'] } },
    { title: 'Database Connection Pool', description: 'Too many connections error.', scenario: 'Mission: Production crashes with "too many connections".\n\nCode creates a new database connection for every request.\n\nWhat is the fix?', difficulty: 'MEDIUM', xpReward: 60, taskData: { expectedKeywords: ['connection pool', 'pool', 'reuse', 'singleton', 'max connections'] } },
    { title: 'Missing Index', description: 'Query takes 30 seconds.', scenario: 'Mission: SELECT * FROM orders WHERE user_id = ? takes 30 seconds on 10M rows.\n\nThe user_id column has no index.\n\nWhat SQL command fixes this?', difficulty: 'EASY', xpReward: 40, taskData: { expectedKeywords: ['CREATE INDEX', 'index', 'user_id'] } },
    { title: 'JWT Expired Token', description: 'Users get logged out randomly.', scenario: 'Mission: Users complain about being logged out after 15 minutes.\n\nJWT config: { expiresIn: "15m" }\nNo refresh token implementation.\n\nWhat is the solution?', difficulty: 'MEDIUM', xpReward: 60, taskData: { expectedKeywords: ['refresh token', 'refresh', 'longer expiry', 'token rotation'] } },
    { title: 'N+1 Query Problem', description: 'Page load sends 100 queries.', scenario: 'Mission: Loading a page with 100 posts sends 101 SQL queries.\n\nCode:\nconst posts = await Post.findAll();\nfor (const post of posts) {\n  post.author = await User.findById(post.authorId);\n}\n\nHow to fix?', difficulty: 'MEDIUM', xpReward: 60, taskData: { expectedKeywords: ['include', 'join', 'eager loading', 'findAll({ include', 'IN clause'] } },
    { title: 'XSS Vulnerability', description: 'User input rendered as HTML.', scenario: 'Mission: Security audit found XSS vulnerability.\n\nCode:\ndocument.innerHTML = userComment;\n\nA user entered: <script>document.cookie</script>\n\nHow to fix?', difficulty: 'MEDIUM', xpReward: 60, taskData: { expectedKeywords: ['sanitize', 'textContent', 'escape', 'DOMPurify', 'innerText'] } },
    { title: 'Broken Image Upload', description: 'Images upload but don\'t display.', scenario: 'Mission: Users upload profile pictures but see broken image icons.\n\nThe file saves to /uploads/ but the Express static middleware is:\napp.use(express.static("public"));\n\nWhat is wrong?', difficulty: 'EASY', xpReward: 40, taskData: { expectedKeywords: ['uploads', 'express.static("uploads")', 'static', 'path'] } },
    { title: 'Race Condition in Counter', description: 'Like count is wrong under load.', scenario: 'Mission: A post shows 95 likes but should have 100. Multiple users liked simultaneously.\n\nCode:\nconst post = await Post.findById(id);\npost.likes += 1;\nawait post.save();\n\nWhat is the fix?', difficulty: 'HARD', xpReward: 75, taskData: { expectedKeywords: ['atomic', 'increment', '$inc', 'transaction', 'optimistic locking'] } },
    { title: 'Environment Variable Missing', description: 'App works locally but not in production.', scenario: 'Mission: App deployed to Render. Error: "JWT_SECRET is undefined".\n\nThe .env file exists locally but is in .gitignore.\n\nWhat is the fix?', difficulty: 'EASY', xpReward: 40, taskData: { expectedKeywords: ['environment variable', 'Render dashboard', 'config vars', 'set env', 'production env'] } },
    { title: 'Infinite Re-render', description: 'React component keeps re-rendering.', scenario: 'Mission: Browser freezes when opening user profile.\n\nCode:\nconst [user, setUser] = useState(null);\nconst fetchUser = async () => {\n  const data = await api.get("/user");\n  setUser(data);\n};\nfetchUser();\n\nWhat is wrong?', difficulty: 'MEDIUM', xpReward: 60, taskData: { expectedKeywords: ['useEffect', 'effect', 'dependency', 'infinite loop', 'render cycle'] } },
    { title: 'SSL Certificate Error', description: 'HTTPS not working.', scenario: 'Mission: Users get "Your connection is not private" warning.\n\nThe SSL certificate expired 2 days ago.\n\nImmediate steps?', difficulty: 'EASY', xpReward: 40, taskData: { expectedKeywords: ['renew', 'certificate', 'SSL', 'Let\'s Encrypt', 'certbot'] } },
    { title: 'Slow API Response', description: 'API takes 10 seconds to respond.', scenario: 'Mission: GET /api/dashboard takes 10 seconds.\n\nIt makes 5 sequential database queries that are independent of each other.\n\nHow to optimize?', difficulty: 'MEDIUM', xpReward: 60, taskData: { expectedKeywords: ['Promise.all', 'parallel', 'concurrent', 'async', 'await Promise.all'] } },
    { title: 'Git Merge Conflict', description: 'Two devs edited the same file.', scenario: 'Mission: Git shows merge conflict markers:\n<<<<<<< HEAD\nconst color = "blue";\n=======\nconst color = "red";\n>>>>>>> feature-branch\n\nHow do you resolve this?', difficulty: 'EASY', xpReward: 40, taskData: { expectedKeywords: ['choose', 'edit', 'remove markers', 'conflict markers', 'resolve'] } },
    { title: 'Websocket Disconnect', description: 'Chat messages stop arriving.', scenario: 'Mission: Chat app disconnects after 60 seconds of inactivity.\n\nNo heartbeat/ping mechanism implemented.\n\nWhat to add?', difficulty: 'MEDIUM', xpReward: 60, taskData: { expectedKeywords: ['ping', 'pong', 'heartbeat', 'keepalive', 'reconnect'] } },
    { title: 'Docker Build Failing', description: 'Container won\'t start.', scenario: 'Mission: Docker build fails with "npm ERR! Could not resolve dependency".\n\nDockerfile:\nFROM node:14\nCOPY . .\nRUN npm install\n\npackage.json requires Node 18+.\n\nWhat is the fix?', difficulty: 'EASY', xpReward: 40, taskData: { expectedKeywords: ['node:18', 'node:20', 'FROM node:18', 'update', 'base image'] } },
    { title: 'API Pagination Missing', description: 'Loading 50K records at once.', scenario: 'Mission: GET /api/users returns all 50,000 users. Page takes 15 seconds.\n\nWhat to implement?', difficulty: 'MEDIUM', xpReward: 60, taskData: { expectedKeywords: ['pagination', 'limit', 'offset', 'page', 'cursor', 'skip', 'take'] } },
    { title: 'Broken Deployment Pipeline', description: 'CI/CD fails silently.', scenario: 'Mission: Deployments stopped working. CI/CD logs show tests pass but deployment step has no output.\n\nThe deploy script references an expired service account token.\n\nWhat to check?', difficulty: 'HARD', xpReward: 75, taskData: { expectedKeywords: ['token', 'credentials', 'service account', 'expired', 'rotate', 'secret'] } },
];

async function seedSkillLab() {
    console.log('🎮 Seeding Skill Lab modes and tasks...');

    for (const modeData of modes) {
        const mode = await prisma.gamificationMode.upsert({
            where: { slug: modeData.slug },
            update: { title: modeData.title, description: modeData.description, icon: modeData.icon, orderIndex: modeData.orderIndex },
            create: modeData,
        });
        console.log(`  ✅ Mode: ${mode.title}`);

        let tasks: any[] = [];
        switch (modeData.slug) {
            case 'bug-hunter': tasks = bugHunterTasks; break;
            case 'system-architect': tasks = systemArchitectTasks; break;
            case 'algorithm-arena': tasks = algorithmArenaTasks; break;
            case 'code-quest': tasks = codeQuestTasks; break;
            case 'challenge-arena': tasks = challengeArenaTasks; break;
            case 'dev-simulator': tasks = devSimulatorTasks; break;
        }

        for (let i = 0; i < tasks.length; i++) {
            const t = tasks[i];
            await prisma.gamificationTask.create({
                data: {
                    modeId: mode.id,
                    title: t.title,
                    description: t.description,
                    scenario: t.scenario,
                    difficulty: t.difficulty,
                    xpReward: t.xpReward,
                    taskData: t.taskData,
                    orderIndex: i + 1,
                },
            });
        }
        console.log(`     ${tasks.length} tasks seeded.`);
    }

    console.log('🎮 Skill Lab seeding complete!');
}

seedSkillLab()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
