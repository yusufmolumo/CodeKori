import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Each quest has 3 stages with branching decisions
// Each decision leads to a different next stage scenario
// Format: { stages: [ { scenario, options: [{ text, correct, points, feedback, nextScenario }] } ] }

const questStages: Record<string, any> = {
    'Startup Landing Page': {
        stages: [
            {
                title: 'Stage 1: Initial Approach',
                scenario: 'You are hired to design a landing page for a startup. The client wants fast loading speed and high conversion rates.\n\nChoose your approach:',
                options: [
                    { text: 'Add heavy animations and 4K background video', points: 0, correct: false, feedback: 'Heavy animations will slow loading to 8+ seconds. 53% of users abandon sites that take over 3 seconds to load.', nextStage: 1 },
                    { text: 'Optimize images, lazy load, minimal JavaScript', points: 30, correct: true, feedback: 'Excellent! This approach keeps the page under 2 seconds load time. Performance-first thinking!', nextStage: 1 },
                    { text: 'Use a heavyweight full-stack framework with SSR', points: 10, correct: false, feedback: 'Overkill for a landing page. The framework adds unnecessary bundle size and complexity.', nextStage: 1 },
                    { text: 'Write everything inline in one massive HTML file', points: 5, correct: false, feedback: 'This is unmaintainable and prevents caching of CSS/JS assets.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Image Strategy',
                scenario: 'The client has 20 high-resolution product images. Page loads slowly. How do you handle images?',
                options: [
                    { text: 'Use WebP format with responsive srcset and lazy loading', points: 30, correct: true, feedback: 'WebP reduces size by 30%, srcset serves right sizes, lazy loading defers off-screen images.', nextStage: 2 },
                    { text: 'Just compress them to JPEG quality 10', points: 10, correct: false, feedback: 'Quality 10 makes images blurry. Users need to see products clearly.', nextStage: 2 },
                    { text: 'Load all 20 images immediately at full resolution', points: 0, correct: false, feedback: 'This will make the initial page load massive — 50MB+ of images.', nextStage: 2 },
                    { text: 'Replace all images with placeholder text', points: 5, correct: false, feedback: 'Product images are essential for conversion. You need them, just optimized.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Final Deployment',
                scenario: 'The page is built. Time to deploy. How do you ensure fast loading globally?',
                options: [
                    { text: 'Deploy to a CDN with edge caching and enable gzip/brotli compression', points: 30, correct: true, feedback: 'CDN + compression = fast global delivery. Users worldwide get sub-second loads.' },
                    { text: 'Host on a single server in one region', points: 10, correct: false, feedback: 'Users far from the server will experience high latency.' },
                    { text: 'Upload files via FTP to shared hosting', points: 5, correct: false, feedback: 'Shared hosting is slow, unreliable, and has no CDN or edge caching.' },
                    { text: 'Run the site from your local computer', points: 0, correct: false, feedback: 'Your home internet cannot handle traffic and uptime requirements.' }
                ]
            }
        ]
    },
    'Database Selection': {
        stages: [
            {
                title: 'Stage 1: Requirements Analysis',
                scenario: 'You\'re building a social network. Users have complex relationships — friends, followers, groups, recommendations.\n\nFirst step: understand your data model.',
                options: [
                    { text: 'Map out entity relationships and query patterns', points: 30, correct: true, feedback: 'Great! Understanding relationships first helps choose the right database.', nextStage: 1 },
                    { text: 'Just pick the most popular database', points: 5, correct: false, feedback: 'Popularity doesn\'t mean it\'s the right fit. Always analyze requirements first.', nextStage: 1 },
                    { text: 'Use a spreadsheet as the database', points: 0, correct: false, feedback: 'Spreadsheets can\'t handle concurrent users or complex queries.', nextStage: 1 },
                    { text: 'Skip database, store everything in browser localStorage', points: 0, correct: false, feedback: 'localStorage is per-device, per-browser. Social networks need shared persistent storage.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Database Choice',
                scenario: 'Your data model shows heavy relationship traversal: "friends of friends", "people you may know", "mutual connections".\n\nWhich database type?',
                options: [
                    { text: 'Graph database (Neo4j) — optimized for relationship traversal', points: 30, correct: true, feedback: 'Graph databases excel at traversing relationships. "Friends of friends" is a native operation.', nextStage: 2 },
                    { text: 'Relational (PostgreSQL) with join tables', points: 15, correct: false, feedback: 'Works but JOIN queries for deep relationships become very slow at scale.', nextStage: 2 },
                    { text: 'Document store (MongoDB) with embedded arrays', points: 5, correct: false, feedback: 'Embedded friend lists become massive and hard to query bidirectionally.', nextStage: 2 },
                    { text: 'Key-value store (Redis) for everything', points: 0, correct: false, feedback: 'Redis is great for caching but not for complex relationship queries.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Scaling Strategy',
                scenario: 'Your social network has 1M users. The "People You May Know" feature is slow.\n\nHow do you optimize?',
                options: [
                    { text: 'Add a caching layer and pre-compute recommendations with background jobs', points: 30, correct: true, feedback: 'Pre-computing recommendations + cache = instant suggestions for users.' },
                    { text: 'Run the algorithm in real-time on every page load', points: 5, correct: false, feedback: 'Real-time computation at 1M users will cause terrible page load times.' },
                    { text: 'Remove the feature entirely', points: 0, correct: false, feedback: 'This feature drives engagement. Optimize it, don\'t remove it.' },
                    { text: 'Show random users as suggestions', points: 5, correct: false, feedback: 'Random suggestions aren\'t useful and reduce user trust in the platform.' }
                ]
            }
        ]
    },
    'Security First': {
        stages: [
            {
                title: 'Stage 1: Password Storage',
                scenario: 'Your client says "Just store passwords in plain text, it\'s faster to develop."\n\nHow do you respond?',
                options: [
                    { text: 'Explain risks and implement bcrypt hashing with salt', points: 30, correct: true, feedback: 'Professional response. Bcrypt with salt is the industry standard for password security.', nextStage: 1 },
                    { text: 'Agree with the client — they\'re paying', points: 0, correct: false, feedback: 'This is a security disaster. A single breach exposes every user\'s password.', nextStage: 1 },
                    { text: 'Use Base64 encoding', points: 5, correct: false, feedback: 'Base64 is encoding, not encryption. It\'s trivially reversible.', nextStage: 1 },
                    { text: 'Use MD5 hashing', points: 10, correct: false, feedback: 'MD5 is cryptographically broken. Rainbow table attacks can crack it instantly.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Authentication Tokens',
                scenario: 'Passwords are hashed. Now you need session management. How do you handle user sessions?',
                options: [
                    { text: 'JWT with short expiry + secure refresh tokens', points: 30, correct: true, feedback: 'Short-lived JWTs with refresh tokens balance security and user experience.', nextStage: 2 },
                    { text: 'Store user ID in a cookie with no encryption', points: 0, correct: false, feedback: 'Anyone can modify the cookie and impersonate other users.', nextStage: 2 },
                    { text: 'Keep users logged in forever', points: 5, correct: false, feedback: 'Permanent sessions are a security risk if a device is stolen.', nextStage: 2 },
                    { text: 'Make users log in on every page navigation', points: 10, correct: false, feedback: 'Terrible UX. Users will abandon your app.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Data Breach Response',
                scenario: 'Despite precautions, you discover a potential SQL injection vulnerability in a legacy endpoint.\n\nWhat do you do?',
                options: [
                    { text: 'Immediately patch the vulnerability, audit other endpoints, and notify stakeholders', points: 30, correct: true, feedback: 'Fast action + thorough audit + transparency. This is the professional response.' },
                    { text: 'Ignore it — no one\'s exploited it yet', points: 0, correct: false, feedback: 'Ignoring known vulnerabilities is negligent and potentially illegal.' },
                    { text: 'Shut down the entire application', points: 10, correct: false, feedback: 'Overreaction. Patch the specific endpoint, don\'t take everything offline.' },
                    { text: 'Add a firewall rule and move on', points: 10, correct: false, feedback: 'WAF rules help but don\'t fix the root cause. You must fix the code too.' }
                ]
            }
        ]
    },
    'Mobile-First Design': {
        stages: [
            {
                title: 'Stage 1: Assessment', scenario: 'The app has 70% mobile users but was designed desktop-first. Layouts break on phones.\n\nFirst step?', options: [
                    { text: 'Audit the current breakpoints and redesign using mobile-first CSS', points: 30, correct: true, feedback: 'Mobile-first means starting with the smallest screen and scaling up. Smart approach!', nextStage: 1 },
                    { text: 'Just add media queries at the end for mobile', points: 10, correct: false, feedback: 'Desktop-first media queries are harder to maintain and often miss edge cases.', nextStage: 1 },
                    { text: 'Create a completely separate mobile website', points: 5, correct: false, feedback: 'Maintaining two codebases doubles your work. Responsive design is better.', nextStage: 1 },
                    { text: 'Tell mobile users to rotate their phones', points: 0, correct: false, feedback: 'Users shouldn\'t have to adapt to your design.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Touch Targets', scenario: 'After the redesign, users report buttons are too small to tap on mobile.\n\nHow do you fix this?', options: [
                    { text: 'Set minimum touch targets to 44x44px and add proper spacing', points: 30, correct: true, feedback: 'Apple and Google both recommend 44px minimum touch targets. Good UX!', nextStage: 2 },
                    { text: 'Make all buttons full-width', points: 10, correct: false, feedback: 'Full-width buttons work for primary CTAs but not for every element.', nextStage: 2 },
                    { text: 'Add a "zoom in" instruction', points: 0, correct: false, feedback: 'Users shouldn\'t need to zoom. Design for the viewport.', nextStage: 2 },
                    { text: 'Remove some buttons to simplify', points: 5, correct: false, feedback: 'Removing functionality hurts usability. Resize them instead.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Performance', scenario: 'Mobile users on 3G report 10-second load times.\n\nWhat\'s the highest-impact fix?', options: [
                    { text: 'Code split, lazy load images, reduce JS bundle by 60%', points: 30, correct: true, feedback: 'Reducing bundle size has the biggest impact on slow connections.' },
                    { text: 'Tell users to use WiFi', points: 0, correct: false, feedback: 'You can\'t control user network conditions. Your app must adapt.' },
                    { text: 'Add a loading spinner', points: 5, correct: false, feedback: 'Spinners don\'t fix the speed — they just acknowledge the problem.' },
                    { text: 'Upgrade the server', points: 10, correct: false, feedback: 'The bottleneck is download size, not server speed.' }
                ]
            }
        ]
    },
    'API Rate Limiting': {
        stages: [
            {
                title: 'Stage 1: Incident', scenario: 'Your free-tier API is getting 10,000 requests/sec from one user, causing slowdowns for everyone.\n\nImmediate action?', options: [
                    { text: 'Implement rate limiting per API key (100 req/min)', points: 30, correct: true, feedback: 'Rate limiting protects your service while keeping it available for legitimate users.', nextStage: 1 },
                    { text: 'Shut down the entire API', points: 5, correct: false, feedback: 'This punishes all users for one bad actor.', nextStage: 1 },
                    { text: 'Scale up to handle 10K req/sec', points: 10, correct: false, feedback: 'You\'d be paying to serve an abuser. Rate limiting is cheaper and more effective.', nextStage: 1 },
                    { text: 'Ignore it', points: 0, correct: false, feedback: 'Your other users are suffering. Action is needed.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Algorithm Choice', scenario: 'Rate limiting is implemented. Which algorithm do you choose for fair limiting?', options: [
                    { text: 'Token bucket — allows short bursts while maintaining average rate', points: 30, correct: true, feedback: 'Token bucket is the most flexible. It allows legitimate bursts while capping sustained abuse.', nextStage: 2 },
                    { text: 'Fixed window — simple counter reset every minute', points: 15, correct: false, feedback: 'Works but has edge cases at window boundaries where double traffic can slip through.', nextStage: 2 },
                    { text: 'No algorithm, just reject all requests above 1/sec', points: 5, correct: false, feedback: 'Too aggressive. Normal users often make several requests quickly.', nextStage: 2 },
                    { text: 'Rate limit by IP address only', points: 10, correct: false, feedback: 'IP-based limiting blocks whole offices or shared networks unfairly.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Response Strategy', scenario: 'A rate-limited user complains. They say they need higher limits for a business use case.\n\nHow do you handle it?', options: [
                    { text: 'Offer a paid tier with higher limits and dedicated support', points: 30, correct: true, feedback: 'This turns abuse into revenue! Paid tiers with higher limits are industry standard.' },
                    { text: 'Remove their rate limits entirely', points: 0, correct: false, feedback: 'Without limits, they could abuse the service again.' },
                    { text: 'Block their account permanently', points: 5, correct: false, feedback: 'Losing a potential paying customer is bad business.' },
                    { text: 'Give them a slightly higher free limit', points: 10, correct: false, feedback: 'This doesn\'t solve the underlying need. A paid tier is more sustainable.' }
                ]
            }
        ]
    },
    'Tech Stack Decision': {
        stages: [
            {
                title: 'Stage 1: Requirements', scenario: 'Build a real-time analytics dashboard with live-updating charts.\n\nWhat frontend technology?', options: [
                    { text: 'React with WebSocket connections for real-time data', points: 30, correct: true, feedback: 'React + WebSockets = reactive UI with live data streaming. Perfect combo!', nextStage: 1 },
                    { text: 'Static HTML with manual browser refresh', points: 0, correct: false, feedback: 'Manual refresh defeats the purpose of real-time analytics.', nextStage: 1 },
                    { text: 'jQuery with 30-second polling', points: 10, correct: false, feedback: 'Polling wastes bandwidth and has 30-second delays. Not truly real-time.', nextStage: 1 },
                    { text: 'Plain JavaScript with iframes', points: 0, correct: false, feedback: 'Iframes are a poor approach for real-time dashboards.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Chart Library', scenario: 'You need live-updating charts. Which library do you choose?', options: [
                    { text: 'D3.js or Chart.js with streaming data support', points: 30, correct: true, feedback: 'Both support dynamic updates. D3 is powerful for custom viz, Chart.js is simpler.', nextStage: 2 },
                    { text: 'HTML tables that re-render every second', points: 5, correct: false, feedback: 'Tables aren\'t charts. Visualization matters for analytics.', nextStage: 2 },
                    { text: 'Static PNG images generated server-side', points: 5, correct: false, feedback: 'Static images can\'t update in real-time without full page reload.', nextStage: 2 },
                    { text: 'Build charts from scratch with canvas', points: 15, correct: false, feedback: 'Reinventing the wheel. Libraries handle scaling, accessibility, and edge cases.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Scaling', scenario: 'Dashboard now has 500 concurrent users. WebSocket connections are overwhelming the server.\n\nSolution?', options: [
                    { text: 'Use Redis pub/sub to distribute WebSocket messages across multiple servers', points: 30, correct: true, feedback: 'Redis pub/sub allows horizontal scaling of WebSocket connections.' },
                    { text: 'Limit dashboard to 50 users', points: 5, correct: false, feedback: 'Limiting users is a band-aid, not a solution.' },
                    { text: 'Switch to polling to reduce connections', points: 10, correct: false, feedback: 'Polling uses MORE total resources than persistent WebSocket connections.' },
                    { text: 'Buy a bigger server', points: 10, correct: false, feedback: 'Vertical scaling has limits. Horizontal scaling with Redis is more sustainable.' }
                ]
            }
        ]
    },
    'Deployment Strategy': {
        stages: [
            {
                title: 'Stage 1: Deploy Plan', scenario: 'Production app serves 10K users. Need to deploy a new version with breaking database changes.\n\nStrategy?', options: [
                    { text: 'Blue-green deployment with database migration rollback plan', points: 30, correct: true, feedback: 'Blue-green gives zero downtime. Rollback plan handles failures gracefully.', nextStage: 1 },
                    { text: 'Take site down for maintenance, deploy, bring back up', points: 10, correct: false, feedback: 'Downtime means lost revenue and frustrated users.', nextStage: 1 },
                    { text: 'Deploy directly to production on a Friday afternoon', points: 0, correct: false, feedback: 'Never deploy on Friday! If something breaks, you\'ll be debugging all weekend.', nextStage: 1 },
                    { text: 'Ask users to clear their cache', points: 0, correct: false, feedback: 'Cache clearing doesn\'t help with backend/database changes.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Rollback', scenario: 'The deployment went through but users report 500 errors on checkout.\n\nWhat do you do?', options: [
                    { text: 'Immediately roll back to the previous version, investigate, and hot-fix', points: 30, correct: true, feedback: 'Fast rollback minimizes impact. Investigate root cause after service is restored.', nextStage: 2 },
                    { text: 'Start debugging on production while users are affected', points: 5, correct: false, feedback: 'Every minute of debugging is lost revenue. Rollback first, debug second.', nextStage: 2 },
                    { text: 'Post on social media that you\'re aware of the issue', points: 10, correct: false, feedback: 'Communication is good but fixing the issue is the priority.', nextStage: 2 },
                    { text: 'Wait and see if it fixes itself', points: 0, correct: false, feedback: 'Software bugs don\'t fix themselves. Users are losing money.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Prevention', scenario: 'After the incident, how do you prevent future deployment failures?', options: [
                    { text: 'Add staging environment, automated tests, and canary deployments', points: 30, correct: true, feedback: 'Staging + tests + canary = catch issues before they reach all users.' },
                    { text: 'Deploy less frequently', points: 10, correct: false, feedback: 'Less frequent deploys often mean bigger, riskier deploys.' },
                    { text: 'Blame the developer who wrote the bug', points: 0, correct: false, feedback: 'Blame culture destroys teams. Focus on process, not people.' },
                    { text: 'Hire a dedicated deployment person', points: 5, correct: false, feedback: 'Automation is better than manual deployment by any individual.' }
                ]
            }
        ]
    },
    'Error Handling': {
        stages: [
            {
                title: 'Stage 1: The Problem', scenario: 'Users see raw errors like "Error: ECONNREFUSED 127.0.0.1:5432" on screen.\n\nFirst fix?', options: [
                    { text: 'Catch errors globally and show user-friendly messages', points: 30, correct: true, feedback: 'Users should see "Something went wrong" not database connection strings.', nextStage: 1 },
                    { text: 'Show technical errors to help users debug', points: 0, correct: false, feedback: 'Users can\'t fix your server. Technical details expose security info.', nextStage: 1 },
                    { text: 'Hide all errors silently', points: 10, correct: false, feedback: 'Users need to know something went wrong, just not the technical details.', nextStage: 1 },
                    { text: 'Redirect to Google', points: 0, correct: false, feedback: 'This is not a solution.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Logging', scenario: 'Errors are hidden from users. But you need to debug production issues.\n\nHow do you track errors?', options: [
                    { text: 'Use error monitoring (Sentry/LogRocket) with structured logging', points: 30, correct: true, feedback: 'Error monitoring catches exceptions with full context for debugging.', nextStage: 2 },
                    { text: 'Check server logs manually via SSH', points: 10, correct: false, feedback: 'Manual log checking is slow and doesn\'t scale across multiple servers.', nextStage: 2 },
                    { text: 'Ask users to screenshot their errors', points: 5, correct: false, feedback: 'You already hid the errors from users. They can\'t screenshot them.', nextStage: 2 },
                    { text: 'Don\'t track errors. If it works, it works', points: 0, correct: false, feedback: 'Silent failures accumulate until they cause a major outage.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: User Recovery', scenario: 'An error occurs during form submission. The user\'s 10 minutes of data entry might be lost.\n\nHow do you handle this?', options: [
                    { text: 'Auto-save form drafts, retry the submission, and show recovery option', points: 30, correct: true, feedback: 'Auto-save + retry = users never lose their work. This is pro-level UX.' },
                    { text: 'Show "Error occurred" and clear the form', points: 0, correct: false, feedback: 'Losing user data is the worst possible UX failure.' },
                    { text: 'Disable the submit button after error', points: 0, correct: false, feedback: 'Users can\'t retry if the button is disabled.' },
                    { text: 'Tell users to refresh the page', points: 5, correct: false, feedback: 'Refresh loses unsaved data. Users will be furious.' }
                ]
            }
        ]
    },
    'Code Review Feedback': {
        stages: [
            {
                title: 'Stage 1: Critical Issues', scenario: 'Junior dev submits a PR with console.logs everywhere, no error handling, and hardcoded API keys in the source code.\n\nPriority feedback?', options: [
                    { text: 'Move API keys to environment variables — this is a security emergency', points: 30, correct: true, feedback: 'Hardcoded API keys can be scraped from git history. This must be fixed immediately.', nextStage: 1 },
                    { text: 'Remove all console.logs first', points: 5, correct: false, feedback: 'Console.logs are messy but not a security risk. API keys are the priority.', nextStage: 1 },
                    { text: 'Add comments to explain the code', points: 0, correct: false, feedback: 'Comments are nice but don\'t fix security or quality issues.', nextStage: 1 },
                    { text: 'Approve the PR — it works', points: 0, correct: false, feedback: 'Never approve code with hardcoded secrets.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Mentorship', scenario: 'After fixing the security issues, the junior dev feels discouraged.\n\nHow do you support them?', options: [
                    { text: 'Pair-program on best practices and explain WHY each issue matters', points: 30, correct: true, feedback: 'Teaching the why builds understanding. Pair programming accelerates learning.', nextStage: 2 },
                    { text: 'Rewrite their entire PR yourself', points: 5, correct: false, feedback: 'They won\'t learn if you do it for them.', nextStage: 2 },
                    { text: 'Send a long list of everything wrong', points: 10, correct: false, feedback: 'Overwhelming criticism without guidance discourages growth.', nextStage: 2 },
                    { text: 'Tell them to watch YouTube tutorials', points: 5, correct: false, feedback: 'Generic advice is less helpful than targeted mentorship.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Process Improvement', scenario: 'This isn\'t the first PR with security issues. How do you prevent future problems?', options: [
                    { text: 'Add CI linters, secret scanning, and a PR checklist', points: 30, correct: true, feedback: 'Automation catches issues before humans need to. CI/CD checks are essential.' },
                    { text: 'Make code reviews mandatory from 3 people', points: 10, correct: false, feedback: 'More reviewers slow development. Automation is more efficient.' },
                    { text: 'Only let senior devs commit', points: 0, correct: false, feedback: 'Gatekeeping kills team productivity and morale.' },
                    { text: 'Add a "no bugs" rule to the company handbook', points: 0, correct: false, feedback: 'Rules without tooling don\'t prevent bugs.' }
                ]
            }
        ]
    },
    'Scalability Planning': {
        stages: [
            {
                title: 'Stage 1: Analysis', scenario: 'Your app grew from 100 to 100K users. Database queries are slow and responses take 5+ seconds.\n\nFirst optimization?', options: [
                    { text: 'Add database indexes and optimize the slowest queries', points: 30, correct: true, feedback: 'Index + query optimization is the highest-impact, lowest-effort improvement.', nextStage: 1 },
                    { text: 'Rewrite the entire app in Rust', points: 0, correct: false, feedback: 'Language doesn\'t matter much when the DB is the bottleneck.', nextStage: 1 },
                    { text: 'Buy a $10K/month dedicated server', points: 10, correct: false, feedback: 'Hardware doesn\'t fix algorithmic problems. Bad queries on fast hardware still slow.', nextStage: 1 },
                    { text: 'Delete old user accounts to shrink the database', points: 0, correct: false, feedback: 'Deleting data is destructive and doesn\'t fix the root cause.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Caching', scenario: 'Queries are optimized but your homepage still loads slowly. It makes 12 DB calls per request.\n\nNext step?', options: [
                    { text: 'Add Redis cache for frequently accessed data (user profiles, recent posts)', points: 30, correct: true, feedback: 'Redis reads are 10-100x faster than DB queries. Cache hot data!', nextStage: 2 },
                    { text: 'Cache everything forever', points: 5, correct: false, feedback: 'Stale cache shows outdated data. You need TTL and invalidation strategy.', nextStage: 2 },
                    { text: 'Merge all 12 queries into one giant SQL query', points: 10, correct: false, feedback: 'One massive query can be worse than 12 small indexed ones.', nextStage: 2 },
                    { text: 'Show a loading spinner for 5 seconds', points: 0, correct: false, feedback: 'Spinners don\'t fix performance. Users will still leave.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Horizontal Scaling', scenario: 'Traffic continues growing. Single server is at 90% CPU during peak hours.\n\nScaling strategy?', options: [
                    { text: 'Deploy multiple app servers behind a load balancer with auto-scaling', points: 30, correct: true, feedback: 'Horizontal scaling with auto-scaling handles traffic spikes automatically.' },
                    { text: 'Upgrade to a bigger server (vertical scaling)', points: 15, correct: false, feedback: 'Eventually you hit the ceiling. Horizontal scaling is more sustainable.' },
                    { text: 'Throttle all users during peak hours', points: 5, correct: false, feedback: 'Throttling core users hurts engagement and revenue.' },
                    { text: 'Wait until the server crashes', points: 0, correct: false, feedback: 'Reactive scaling causes outages. Plan ahead.' }
                ]
            }
        ]
    },
    'Testing Strategy': {
        stages: [
            {
                title: 'Stage 1: Starting Point', scenario: 'Large codebase with zero tests. Where do you start?\n\nBudget: 1 sprint (2 weeks).', options: [
                    { text: 'Integration tests for the critical user paths (signup, payment, core features)', points: 30, correct: true, feedback: 'Critical path tests give the most coverage per test. Protect what matters most!', nextStage: 1 },
                    { text: 'Unit tests for every single function', points: 10, correct: false, feedback: 'You can\'t unit test everything in 2 weeks. Focus on impact.', nextStage: 1 },
                    { text: 'Skip testing, just ship', points: 0, correct: false, feedback: 'Technical debt grows exponentially. Every bug in production costs 10x more.', nextStage: 1 },
                    { text: 'Hire a QA team to test manually', points: 10, correct: false, feedback: 'Manual testing doesn\'t prevent regressions. Automation does.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Test Architecture', scenario: 'Critical paths are tested. How do you structure ongoing test development?', options: [
                    { text: 'Testing pyramid: many unit tests, fewer integration, fewer E2E', points: 30, correct: true, feedback: 'The testing pyramid balances speed, coverage, and maintenance cost.', nextStage: 2 },
                    { text: 'Only E2E tests that test everything', points: 10, correct: false, feedback: 'E2E tests are slow, flaky, and expensive to maintain.', nextStage: 2 },
                    { text: 'Test in production with feature flags', points: 15, correct: false, feedback: 'Good technique but not a replacement for automated tests.', nextStage: 2 },
                    { text: 'Code review only, no automated tests', points: 5, correct: false, feedback: 'Humans miss bugs. Automated tests catch regressions consistently.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: CI Pipeline', scenario: 'Tests exist but developers forget to run them before merging.\n\nSolution?', options: [
                    { text: 'CI/CD pipeline that blocks merge if tests fail', points: 30, correct: true, feedback: 'CI gates ensure no code reaches production without passing tests.' },
                    { text: 'Trust developers to run tests manually', points: 0, correct: false, feedback: 'Manual processes are forgotten under deadline pressure.' },
                    { text: 'Run tests weekly in a batch', points: 5, correct: false, feedback: 'Weekly runs mean bugs sit in production for days before detection.' },
                    { text: 'Remove failing tests so CI passes', points: 0, correct: false, feedback: 'Deleting tests to pass CI is a cardinal sin of software engineering.' }
                ]
            }
        ]
    },
    'Accessibility Audit': {
        stages: [
            {
                title: 'Stage 1: Quick Wins', scenario: 'Screen readers can\'t navigate your app. Images have no alt text, no heading hierarchy.\n\nFirst fix?', options: [
                    { text: 'Add ARIA labels, alt text, and proper heading hierarchy (h1>h2>h3)', points: 30, correct: true, feedback: 'These changes are quick and dramatically improve screen reader experience.', nextStage: 1 },
                    { text: 'Remove all images', points: 0, correct: false, feedback: 'Images provide value. Alt text makes them accessible.', nextStage: 1 },
                    { text: 'Add more colors for visual contrast', points: 5, correct: false, feedback: 'Colors don\'t help screen readers. Semantic HTML does.', nextStage: 1 },
                    { text: 'Build a separate "accessible version"', points: 5, correct: false, feedback: 'Separate versions are unmaintainable. One accessible version for all.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Keyboard Navigation', scenario: 'Users can\'t navigate without a mouse. Tab order is random.\n\nHow do you fix this?', options: [
                    { text: 'Fix tab order, add focus styles, and ensure all interactive elements are keyboard accessible', points: 30, correct: true, feedback: 'Keyboard navigation is essential for motor disability users.', nextStage: 2 },
                    { text: 'Require a mouse for the app', points: 0, correct: false, feedback: 'Excluding keyboard users is discriminatory and often illegal.', nextStage: 2 },
                    { text: 'Add tabindex="999" to every element', points: 5, correct: false, feedback: 'High tabindex values create chaos. Use natural DOM order.', nextStage: 2 },
                    { text: 'Only make the nav keyboard accessible', points: 10, correct: false, feedback: 'All interactive elements need keyboard access, not just the nav.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Color Contrast', scenario: 'WCAG audit reveals light gray text on white backgrounds (1.5:1 ratio). Minimum is 4.5:1.\n\nSolution?', options: [
                    { text: 'Update color palette to meet WCAG 4.5:1 contrast ratio standards', points: 30, correct: true, feedback: 'Meeting WCAG standards makes content readable for everyone.' },
                    { text: 'Use only black and white', points: 10, correct: false, feedback: 'High contrast but you can have good design AND accessibility.' },
                    { text: 'Tell users to adjust their monitors', points: 0, correct: false, feedback: 'Accessibility is your responsibility, not the user\'s.' },
                    { text: 'Ignore it — the site looks nice as is', points: 0, correct: false, feedback: 'Looking nice doesn\'t matter if people can\'t read the text.' }
                ]
            }
        ]
    },
    'Data Privacy': {
        stages: [
            {
                title: 'Stage 1: GDPR Request', scenario: 'A European user requests all their personal data be deleted under GDPR "Right to Erasure."\n\nResponse?', options: [
                    { text: 'Acknowledge within 72 hours, implement data deletion, comply within 30 days', points: 30, correct: true, feedback: 'GDPR requires response within 30 days. Timely compliance avoids massive fines.', nextStage: 1 },
                    { text: 'Ignore the request', points: 0, correct: false, feedback: 'Ignoring GDPR requests can result in fines up to €20M or 4% of revenue.', nextStage: 1 },
                    { text: 'Delete their account but keep all data', points: 5, correct: false, feedback: 'Account deletion ≠ data deletion. GDPR requires actual data erasure.', nextStage: 1 },
                    { text: 'Block all European users', points: 0, correct: false, feedback: 'Blocking users doesn\'t erase existing data and loses an entire market.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Data Architecture', scenario: 'Deleting user data is hard because it\'s scattered across 15 database tables and 3 third-party services.\n\nSolution?', options: [
                    { text: 'Build a centralized data deletion pipeline that cascades across all systems', points: 30, correct: true, feedback: 'Centralized deletion ensures complete, verifiable data removal.', nextStage: 2 },
                    { text: 'Manually delete from each table one by one', points: 10, correct: false, feedback: 'Manual deletion is error-prone and doesn\'t scale.', nextStage: 2 },
                    { text: 'Just anonymize the data instead', points: 15, correct: false, feedback: 'Anonymization can work but must be truly irreversible to comply with GDPR.', nextStage: 2 },
                    { text: 'Redesign the entire database schema', points: 5, correct: false, feedback: 'A full redesign is overkill. Build a deletion pipeline for the existing schema.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Prevention', scenario: 'How do you prevent privacy issues going forward?', options: [
                    { text: 'Privacy by design: minimize data collection, encrypt PII, add data retention policies', points: 30, correct: true, feedback: 'Collecting only necessary data and encrypting PII prevents future issues.' },
                    { text: 'Collect as much data as possible "just in case"', points: 0, correct: false, feedback: 'More data = more liability. Minimize what you collect.' },
                    { text: 'Add a longer privacy policy that covers everything', points: 5, correct: false, feedback: 'Long policies don\'t equal compliance. Actions matter more than words.' },
                    { text: 'Store everything in one big unencrypted table', points: 0, correct: false, feedback: 'Unencrypted PII is a breach waiting to happen.' }
                ]
            }
        ]
    },
    'Monolith to Microservices': {
        stages: [
            {
                title: 'Stage 1: Assessment', scenario: 'Your monolith has 500K lines. Deploys take 2 hours. A bug in one feature breaks everything.\n\nMigration approach?', options: [
                    { text: 'Strangler fig pattern — gradually extract services starting with the most painful modules', points: 30, correct: true, feedback: 'Gradual extraction reduces risk. Start with the most problematic modules.', nextStage: 1 },
                    { text: 'Big bang rewrite — rebuild everything from scratch', points: 0, correct: false, feedback: 'Rewrites take 2-3x longer than estimated and often fail.', nextStage: 1 },
                    { text: 'Add more developers to the monolith', points: 5, correct: false, feedback: 'Brooks\' Law: adding people to a late project makes it later.', nextStage: 1 },
                    { text: 'Split randomly into 50 microservices', points: 0, correct: false, feedback: 'Random splitting creates a distributed monolith — the worst of both worlds.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: First Service', scenario: 'Which module do you extract first?', options: [
                    { text: 'The notification service — well-bounded, independent, and causes the most deploy issues', points: 30, correct: true, feedback: 'Good bounded context + high pain = ideal first extraction.', nextStage: 2 },
                    { text: 'The user authentication system', points: 10, correct: false, feedback: 'Auth is deeply coupled to everything. It\'s risky as a first extraction.', nextStage: 2 },
                    { text: 'The database layer', points: 5, correct: false, feedback: 'Database extraction is the hardest step. Do it at the end.', nextStage: 2 },
                    { text: 'All of them at once', points: 0, correct: false, feedback: 'Extracting everything at once is another version of the big bang approach.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Communication', scenario: 'Your services need to talk to each other. Communication pattern?', options: [
                    { text: 'Async message queue (RabbitMQ/Kafka) for eventual consistency where possible', points: 30, correct: true, feedback: 'Async messaging decouples services and handles failures gracefully.' },
                    { text: 'Direct HTTP calls between all services', points: 10, correct: false, feedback: 'Synchronous HTTP creates tight coupling. One service down = cascade failure.' },
                    { text: 'Shared database between services', points: 0, correct: false, feedback: 'Shared database defeats the purpose of microservices.' },
                    { text: 'gRPC for everything', points: 15, correct: false, feedback: 'gRPC is great for performance but is still synchronous. Use async where possible.' }
                ]
            }
        ]
    },
    'Incident Response': {
        stages: [
            {
                title: 'Stage 1: Alert', scenario: '3am alert: production is down. Users can\'t login. Your phone is buzzing.\n\nFirst step?', options: [
                    { text: 'Check error logs and monitoring dashboards to identify the issue', points: 30, correct: true, feedback: 'Observability first. Understand the problem before reacting.', nextStage: 1 },
                    { text: 'Go back to sleep', points: 0, correct: false, feedback: 'Production outages need immediate attention.', nextStage: 1 },
                    { text: 'Immediately start coding a fix without understanding the problem', points: 5, correct: false, feedback: 'Blind fixes can make things worse. Diagnose first.', nextStage: 1 },
                    { text: 'Email the CEO', points: 5, correct: false, feedback: 'Executives don\'t need 3am emails. Fix the issue first.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Root Cause', scenario: 'Logs show: database connection pool exhausted. 500 connections open, max is 100.\n\nImmediate action?', options: [
                    { text: 'Kill zombie connections, increase pool limit temporarily, and investigate the leak', points: 30, correct: true, feedback: 'Immediate relief + investigation. Professional incident response.', nextStage: 2 },
                    { text: 'Restart the database server', points: 15, correct: false, feedback: 'Restart fixes symptoms but doesn\'t prevent recurrence.', nextStage: 2 },
                    { text: 'Set max connections to 10000', points: 5, correct: false, feedback: 'Masking the leak. You\'ll hit 10000 too eventually.', nextStage: 2 },
                    { text: 'Switch to a different database', points: 0, correct: false, feedback: 'The issue is in your application code, not the database software.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Post-Mortem', scenario: 'Service is restored. How do you prevent this from happening again?', options: [
                    { text: 'Write a post-mortem, add connection monitoring alerts, and fix the connection leak', points: 30, correct: true, feedback: 'Blameless post-mortem + monitoring + fix = complete incident resolution.' },
                    { text: 'Blame the developer who wrote the leaky code', points: 0, correct: false, feedback: 'Blame culture prevents honest reporting of issues.' },
                    { text: 'Do nothing — it probably won\'t happen again', points: 0, correct: false, feedback: 'It will absolutely happen again without the fix.' },
                    { text: 'Add a cron job to restart the server every hour', points: 5, correct: false, feedback: 'Scheduled restarts mask bugs and cause brief outages every hour.' }
                ]
            }
        ]
    },
    'State Management': {
        stages: [
            {
                title: 'Stage 1: The Problem', scenario: 'React app has props being passed through 8 levels of components. Adding any new feature requires changing 8 files.\n\nSolution?', options: [
                    { text: 'Use React Context API for shared state to avoid prop drilling', points: 30, correct: true, feedback: 'Context API eliminates prop drilling for shared state like theme, auth, etc.', nextStage: 1 },
                    { text: 'Keep passing props — it\'s the "React way"', points: 5, correct: false, feedback: 'Prop drilling through 8 levels is an anti-pattern, not the React way.', nextStage: 1 },
                    { text: 'Use global window variables', points: 0, correct: false, feedback: 'Global variables break React\'s rendering model and cause stale UI.', nextStage: 1 },
                    { text: 'Store everything in localStorage', points: 5, correct: false, feedback: 'localStorage doesn\'t trigger re-renders. UI won\'t update.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Growing Complexity', scenario: 'The app now has 20+ interconnected state contexts. Performance is degrading.\n\nNext step?', options: [
                    { text: 'Introduce Zustand or Redux Toolkit for centralized state management', points: 30, correct: true, feedback: 'Dedicated state management libraries handle complex state with better performance.', nextStage: 2 },
                    { text: 'Add more contexts, one per component', points: 0, correct: false, feedback: 'More contexts means more re-renders and harder debugging.', nextStage: 2 },
                    { text: 'Combine all 20 contexts into one giant context', points: 5, correct: false, feedback: 'One massive context re-renders the entire app on any change.', nextStage: 2 },
                    { text: 'Move all state to the server', points: 10, correct: false, feedback: 'Server state and client state serve different purposes. You need both.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Server State', scenario: 'You realize half the "state" is actually cached API data. It\'s getting stale.\n\nHow do you handle server state?', options: [
                    { text: 'Use React Query / TanStack Query for server state with automatic refetching', points: 30, correct: true, feedback: 'React Query separates server state from client state beautifully.' },
                    { text: 'Keep it all in Redux with manual fetch actions', points: 10, correct: false, feedback: 'Redux for server state means lots of boilerplate and manual cache invalidation.' },
                    { text: 'Fetch data fresh on every render', points: 0, correct: false, feedback: 'Fetching on every render hammers your API and causes flicker.' },
                    { text: 'Use localStorage as a cache', points: 5, correct: false, feedback: 'localStorage has no automatic invalidation or refetching.' }
                ]
            }
        ]
    },
    'Performance Optimization': {
        stages: [
            {
                title: 'Stage 1: Diagnosis', scenario: 'Lighthouse score is 35. Bundle is 5MB. Time to first paint: 8 seconds.\n\nHighest-impact fix?', options: [
                    { text: 'Code splitting and lazy loading — reduce initial bundle by 60%', points: 30, correct: true, feedback: 'Splitting the bundle means users only download what they need immediately.', nextStage: 1 },
                    { text: 'Change the font', points: 0, correct: false, feedback: 'Fonts have minimal impact compared to a 5MB bundle.', nextStage: 1 },
                    { text: 'Add more features to justify the load time', points: 0, correct: false, feedback: 'More features = bigger bundle = slower. The opposite direction.', nextStage: 1 },
                    { text: 'Switch hosting provider', points: 5, correct: false, feedback: 'Hosting doesn\'t fix a 5MB client-side bundle problem.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Images', scenario: 'Bundle is optimized. But 15 hero images load immediately, adding 10MB.\n\nOptimization?', options: [
                    { text: 'Lazy load below-fold images, use WebP, and implement responsive srcset', points: 30, correct: true, feedback: 'Only load what\'s visible. Modern formats reduce size 30%. Srcset serves right sizes.', nextStage: 2 },
                    { text: 'Compress all images to 1px quality', points: 5, correct: false, feedback: 'Images need to look good. Find the balance between quality and size.', nextStage: 2 },
                    { text: 'Use SVGs for everything including photos', points: 0, correct: false, feedback: 'SVGs are great for icons but terrible for photos (huge file sizes).', nextStage: 2 },
                    { text: 'Remove all images', points: 5, correct: false, feedback: 'Images are essential for engagement. Optimize, don\'t remove.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Runtime', scenario: 'Page loads fast but scrolling is janky. FPS drops to 15 during scroll.\n\nPerformance fix?', options: [
                    { text: 'Virtualize long lists, debounce scroll handlers, and use CSS will-change for animations', points: 30, correct: true, feedback: 'List virtualization + optimized scroll handlers = smooth 60fps scrolling.' },
                    { text: 'Tell users to get a faster computer', points: 0, correct: false, feedback: 'Your code should be efficient on all devices.' },
                    { text: 'Remove scroll animations', points: 15, correct: false, feedback: 'Works but you can keep animations while optimizing performance.' },
                    { text: 'Use setTimeout for scroll handlers', points: 5, correct: false, feedback: 'requestAnimationFrame is better for visual updates than setTimeout.' }
                ]
            }
        ]
    },
    'Git Branching': {
        stages: [
            {
                title: 'Stage 1: Chaos', scenario: '5 developers all pushing to main branch. Merge conflicts daily. No code review.\n\nFirst change?', options: [
                    { text: 'Implement GitFlow with feature branches and mandatory pull requests', points: 30, correct: true, feedback: 'Feature branches isolate work. PRs enable review. Conflicts are minimized.', nextStage: 1 },
                    { text: 'Everyone pushes to main — faster development', points: 0, correct: false, feedback: 'This is the current broken approach. It doesn\'t work at scale.', nextStage: 1 },
                    { text: 'Each developer gets their own repo', points: 0, correct: false, feedback: 'Separate repos means no collaboration and impossible integration.', nextStage: 1 },
                    { text: 'Don\'t use version control', points: 0, correct: false, feedback: 'This would make things exponentially worse.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Review Process', scenario: 'Feature branches are implemented. How do you enforce code quality?', options: [
                    { text: 'Require 1+ approving review before merge, with CI checks passing', points: 30, correct: true, feedback: 'Reviews catch bugs. CI checks ensure tests pass. Protected branches enforce both.', nextStage: 2 },
                    { text: 'Allow self-merging after 24 hours', points: 10, correct: false, feedback: 'Self-merging defeats the purpose of review. Time doesn\'t replace human judgment.', nextStage: 2 },
                    { text: 'Skip reviews for "small" changes', points: 5, correct: false, feedback: 'Small changes cause big bugs. One-line changes have caused massive outages.', nextStage: 2 },
                    { text: 'Let the team lead review all PRs', points: 10, correct: false, feedback: 'One reviewer creates a bottleneck. Share review responsibility.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Release Management', scenario: 'You need to deploy hotfixes without disrupting ongoing feature development.\n\nBranch strategy?', options: [
                    { text: 'Hotfix branch from main, fix, test, merge to both main and develop', points: 30, correct: true, feedback: 'Hotfix branches keep production fixes separate from in-progress features.' },
                    { text: 'Fix bugs directly on main and hope nothing breaks', points: 0, correct: false, feedback: 'Direct main changes skip review and testing. Recipe for disasters.' },
                    { text: 'Wait for the next scheduled release', points: 10, correct: false, feedback: 'Critical bugs can\'t wait for scheduled releases.' },
                    { text: 'Revert the feature that caused the bug', points: 15, correct: false, feedback: 'Sometimes necessary, but a targeted fix is usually better.' }
                ]
            }
        ]
    },
    'Documentation Debt': {
        stages: [
            {
                title: 'Stage 1: Starting Point', scenario: 'New developer joins. No API docs exist. They spend 3 days reading source code to understand one endpoint.\n\nBest approach?', options: [
                    { text: 'Generate OpenAPI/Swagger docs from code annotations', points: 30, correct: true, feedback: 'Auto-generated docs stay in sync with code. Swagger UI makes them interactive.', nextStage: 1 },
                    { text: 'Tell them to "just read the code"', points: 0, correct: false, feedback: 'Reading source code is not documentation. Self-documenting code is a myth.', nextStage: 1 },
                    { text: 'Write a single Word document', points: 5, correct: false, feedback: 'Word docs get outdated instantly and aren\'t searchable.', nextStage: 1 },
                    { text: 'Record a 4-hour video walkthrough', points: 10, correct: false, feedback: 'Videos are hard to search and can\'t be updated incrementally.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Keeping Docs Updated', scenario: 'Swagger docs are generated. But developers add new endpoints without updating docs.\n\nSolution?', options: [
                    { text: 'Add CI check that fails if API docs are missing for any endpoint', points: 30, correct: true, feedback: 'Automated enforcement ensures docs stay complete. No human remembering needed.', nextStage: 2 },
                    { text: 'Have a monthly "doc day"', points: 10, correct: false, feedback: 'Monthly updates mean docs are always 30 days stale.', nextStage: 2 },
                    { text: 'Assign one person to maintain all docs', points: 5, correct: false, feedback: 'Bottleneck person. When they leave, knowledge is lost.', nextStage: 2 },
                    { text: 'Accept that docs will always be outdated', points: 0, correct: false, feedback: 'With the right tooling, docs can stay current.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Developer Experience', scenario: 'Docs exist but are hard to discover. New developers don\'t know they exist.\n\nImprovement?', options: [
                    { text: 'Add docs link to README, onboarding guide, and API error responses', points: 30, correct: true, feedback: 'Discoverability is key. Put docs where developers naturally look.' },
                    { text: 'Print and distribute physical copies', points: 0, correct: false, feedback: 'It\'s 2024. Paper docs are immediately outdated.' },
                    { text: 'Email all developers quarterly about the docs', points: 5, correct: false, feedback: 'Quarterly emails are ignored. Put links where people already work.' },
                    { text: 'Add a chatbot that answers docs questions', points: 15, correct: false, feedback: 'Chatbots are nice additions but don\'t replace accessible written docs.' }
                ]
            }
        ]
    },
    'Feature Flags': {
        stages: [
            {
                title: 'Stage 1: Implementation', scenario: 'You want to test a new checkout flow with 10% of users before rolling it out fully.\n\nApproach?', options: [
                    { text: 'Implement feature flags with gradual percentage-based rollout', points: 30, correct: true, feedback: 'Feature flags let you control rollout, A/B test, and roll back instantly.', nextStage: 1 },
                    { text: 'Deploy two completely separate versions of the site', points: 5, correct: false, feedback: 'Two versions doubles maintenance and confuses support teams.', nextStage: 1 },
                    { text: 'Ask 10% of users to opt-in manually', points: 10, correct: false, feedback: 'Self-selection bias means your test group isn\'t representative.', nextStage: 1 },
                    { text: 'Just deploy to everyone and hope for the best', points: 0, correct: false, feedback: 'All-or-nothing deployments are high risk. Feature flags reduce risk.', nextStage: 1 }
                ]
            },
            {
                title: 'Stage 2: Monitoring', scenario: 'The new checkout is live for 10% of users. How do you measure success?', options: [
                    { text: 'Track conversion rates, error rates, and page load times — compare with control group', points: 30, correct: true, feedback: 'A/B metrics with a control group give you statistically valid results.', nextStage: 2 },
                    { text: 'Ask users if they like it', points: 10, correct: false, feedback: 'Subjective feedback is useful but not sufficient. Numbers don\'t lie.', nextStage: 2 },
                    { text: 'Check if the server is still running', points: 5, correct: false, feedback: '"Not crashing" is the bare minimum. You need business metrics.', nextStage: 2 },
                    { text: 'Wait a month and see what happens', points: 5, correct: false, feedback: 'A month without monitoring means silent failures go undetected.', nextStage: 2 }
                ]
            },
            {
                title: 'Stage 3: Full Rollout', scenario: 'New checkout has 15% higher conversion in tests. Time to roll out.\n\nStrategy?', options: [
                    { text: 'Gradually increase: 10% → 25% → 50% → 100%, monitoring at each stage', points: 30, correct: true, feedback: 'Gradual rollout catches edge cases at each scale. Safe and data-driven.' },
                    { text: 'Flip the flag to 100% immediately', points: 10, correct: false, feedback: 'Jumping from 10% to 100% risks edge cases that only appear at scale.' },
                    { text: 'Keep it at 10% forever', points: 5, correct: false, feedback: '90% of users are missing out on a better experience.' },
                    { text: 'Remove the flag and the old code immediately', points: 5, correct: false, feedback: 'Keep the flag for rollback ability. Remove old code after the rollout is stable.' }
                ]
            }
        ]
    },
};

async function updateCodeQuestStages() {
    console.log('Updating Code Quest tasks with branching stages...\n');

    for (const [title, questData] of Object.entries(questStages)) {
        const tasks = await prisma.gamificationTask.findMany({
            where: { title }
        });

        for (const task of tasks) {
            const existingData = (task.taskData as any) || {};
            await prisma.gamificationTask.update({
                where: { id: task.id },
                data: {
                    taskData: {
                        ...existingData,
                        questStages: questData.stages
                    }
                }
            });
        }
        console.log(`  ✅ ${title}`);
    }

    console.log('\nDone!');
    await prisma.$disconnect();
}

updateCodeQuestStages().catch(console.error);
