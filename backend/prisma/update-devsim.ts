import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Add fullAnswer + mission metadata to all Dev Simulator tasks
const devSimData: Record<string, { fullAnswer: string; errorLog?: string; codeSnippet?: string; missionRole: string; missionCompany: string }> = {
    'Login System Failing': {
        missionRole: 'Junior Developer',
        missionCompany: 'FinTech Startup',
        errorLog: 'bcrypt.compare: data and hash arguments required',
        codeSnippet: `async function login(email, password) {
  const user = await db.findUser(email);
  const match = await bcrypt.compare(password);
  return match;
}`,
        fullAnswer: `The bug is that bcrypt.compare() requires two arguments: the plain text password and the stored hash. The fix is:

const match = await bcrypt.compare(password, user.passwordHash);

The second argument (user.passwordHash) is missing from the original code.`
    },
    'Broken Checkout Flow': {
        missionRole: 'Backend Developer',
        missionCompany: 'E-Commerce Platform',
        errorLog: 'TypeError: Cannot read property \'id\' of undefined',
        codeSnippet: `const order = await createOrder(cart.items);
await chargeCard(order.id, user.paymentMethod.id);`,
        fullAnswer: `The bug is that user.paymentMethod could be undefined/null if the user hasn't added a payment method. The fix is to add a null check:

if (!user.paymentMethod) {
  throw new Error('No payment method on file');
}
await chargeCard(order.id, user.paymentMethod.id);

Or use optional chaining: user.paymentMethod?.id with proper error handling.`
    },
    'Memory Leak in Dashboard': {
        missionRole: 'Frontend Developer',
        missionCompany: 'SaaS Analytics',
        codeSnippet: `useEffect(() => {
  const interval = setInterval(fetchStats, 3000);
}, []);`,
        fullAnswer: `The useEffect is missing a cleanup function to clear the interval when the component unmounts. Fix:

useEffect(() => {
  const interval = setInterval(fetchStats, 3000);
  return () => clearInterval(interval);
}, []);

The return function runs on unmount and clears the interval, preventing the memory leak.`
    },
    'CORS Blocking API': {
        missionRole: 'Full-Stack Developer',
        missionCompany: 'Startup',
        errorLog: 'Access to fetch at http://localhost:5000 from origin http://localhost:3000 has been blocked by CORS policy',
        fullAnswer: `Add CORS middleware to the Express server:

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

This allows the React frontend on port 3000 to make requests to the Express API on port 5000.`
    },
    'Database Connection Pool': {
        missionRole: 'Backend Developer',
        missionCompany: 'Production App',
        errorLog: 'Error: Too many connections (max: 100)',
        fullAnswer: `The fix is to use a connection pool instead of creating new connections per request:

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'app',
  connectionLimit: 10
});

// Reuse pool for all queries
pool.query('SELECT * FROM users', callback);

Use a singleton pattern to ensure only one pool instance exists across the application.`
    },
    'Missing Index': {
        missionRole: 'Database Administrator',
        missionCompany: 'E-Commerce',
        errorLog: 'Query execution time: 30,247ms',
        codeSnippet: `SELECT * FROM orders WHERE user_id = ?
-- Execution plan: Full Table Scan on 10M rows`,
        fullAnswer: `CREATE INDEX idx_orders_user_id ON orders(user_id);

This creates a B-tree index on the user_id column, allowing the database to find matching rows in O(log n) time instead of scanning all 10M rows.`
    },
    'JWT Expired Token': {
        missionRole: 'Backend Developer',
        missionCompany: 'FinTech App',
        codeSnippet: `const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
// No refresh token implementation`,
        fullAnswer: `Implement refresh tokens:

// On login, issue both tokens:
const accessToken = jwt.sign(payload, SECRET, { expiresIn: '15m' });
const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

// Create /api/refresh endpoint:
app.post('/api/refresh', (req, res) => {
  const decoded = jwt.verify(req.body.refreshToken, REFRESH_SECRET);
  const newAccessToken = jwt.sign({ userId: decoded.userId }, SECRET, { expiresIn: '15m' });
  res.json({ accessToken: newAccessToken });
});`
    },
    'N+1 Query Problem': {
        missionRole: 'Backend Developer',
        missionCompany: 'Blog Platform',
        codeSnippet: `const posts = await Post.findAll();
for (const post of posts) {
  post.author = await User.findById(post.authorId);
}`,
        fullAnswer: `Use eager loading / JOIN to fetch posts with their authors in a single query:

const posts = await Post.findAll({
  include: [{ model: User, as: 'author' }]
});

This generates a single SQL JOIN query instead of 101 separate queries (1 for posts + 100 for authors).`
    },
    'XSS Vulnerability': {
        missionRole: 'Security Engineer',
        missionCompany: 'Social Platform',
        errorLog: 'Security Audit: XSS vulnerability detected in user comments',
        codeSnippet: `document.innerHTML = userComment;
// User entered: <script>document.cookie</script>`,
        fullAnswer: `Never use innerHTML with user input. Fix options:

// Option 1: Use textContent (safest)
element.textContent = userComment;

// Option 2: Use DOMPurify library
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userComment);

// Option 3: Escape HTML entities
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"
  }[char]));
}`
    },
    'Broken Image Upload': {
        missionRole: 'Full-Stack Developer',
        missionCompany: 'Social Media App',
        codeSnippet: `// Files save to: /uploads/profile_pics/
// Express middleware:
app.use(express.static("public"));`,
        fullAnswer: `The static middleware points to "public" but files are saved to "uploads". Fix:

app.use('/uploads', express.static('uploads'));

Or move the upload directory inside public:
app.use(express.static('public'));
// Save files to: public/uploads/profile_pics/`
    },
    'Race Condition in Counter': {
        missionRole: 'Senior Developer',
        missionCompany: 'Social Platform',
        codeSnippet: `const post = await Post.findById(id);
post.likes += 1;
await post.save();`,
        fullAnswer: `Use atomic increment operation instead of read-modify-write:

// MongoDB:
await Post.updateOne({ _id: id }, { $inc: { likes: 1 } });

// SQL:
UPDATE posts SET likes = likes + 1 WHERE id = ?;

// Or use optimistic locking / transactions to prevent race conditions when multiple users like simultaneously.`
    },
    'Environment Variable Missing': {
        missionRole: 'DevOps Engineer',
        missionCompany: 'Startup',
        errorLog: 'Error: JWT_SECRET is undefined',
        fullAnswer: `The .env file is in .gitignore so it doesn't deploy to production. Fix:

1. Go to Render Dashboard → Your Service → Environment
2. Add environment variable: JWT_SECRET = your_secret_key
3. Add all other .env variables (DATABASE_URL, etc.)
4. Redeploy the service

Never commit .env files to git. Always set environment variables through the hosting platform's dashboard.`
    },
    'Infinite Re-render': {
        missionRole: 'React Developer',
        missionCompany: 'Dashboard App',
        codeSnippet: `const [user, setUser] = useState(null);
const fetchUser = async () => {
  const data = await api.get("/user");
  setUser(data);
};
fetchUser(); // Called on every render!`,
        fullAnswer: `The fetch call runs on every render, which sets state, which triggers another render = infinite loop. Wrap it in useEffect:

useEffect(() => {
  const fetchUser = async () => {
    const data = await api.get("/user");
    setUser(data);
  };
  fetchUser();
}, []); // Empty dependency array = runs once on mount`
    },
    'SSL Certificate Error': {
        missionRole: 'DevOps Engineer',
        missionCompany: 'Production Website',
        errorLog: 'NET::ERR_CERT_DATE_INVALID - Certificate expired 2 days ago',
        fullAnswer: `Immediate steps to fix expired SSL certificate:

1. Renew the certificate:
   sudo certbot renew

2. If using Let's Encrypt, set up auto-renewal:
   sudo crontab -e
   0 0 1 * * certbot renew --quiet

3. Restart the web server:
   sudo systemctl restart nginx

4. Verify: openssl s_client -connect yourdomain.com:443`
    },
    'Slow API Response': {
        missionRole: 'Backend Developer',
        missionCompany: 'Analytics Platform',
        codeSnippet: `// Each query takes ~2 seconds, total = 10 seconds
const users = await db.getUsers();
const orders = await db.getOrders();
const revenue = await db.getRevenue();
const visits = await db.getVisits();
const signups = await db.getSignups();`,
        fullAnswer: `Run independent queries in parallel using Promise.all:

const [users, orders, revenue, visits, signups] = await Promise.all([
  db.getUsers(),
  db.getOrders(),
  db.getRevenue(),
  db.getVisits(),
  db.getSignups()
]);

This runs all 5 queries concurrently, reducing total time from 10s to ~2s (the slowest single query).`
    },
    'Git Merge Conflict': {
        missionRole: 'Developer',
        missionCompany: 'Team Project',
        codeSnippet: `<<<<<<< HEAD
const color = "blue";
=======
const color = "red";
>>>>>>> feature-branch`,
        fullAnswer: `To resolve the merge conflict:

1. Open the file and choose which change to keep (or combine both)
2. Remove the conflict markers (<<<<<<, =====, >>>>>>)
3. Save the resolved version, e.g.:
   const color = "blue"; // or "red" or combine
4. Stage the resolved file: git add filename.js
5. Complete the merge: git commit`
    },
    'Websocket Disconnect': {
        missionRole: 'Backend Developer',
        missionCompany: 'Chat Application',
        fullAnswer: `Implement a heartbeat/ping-pong mechanism:

// Server side:
const interval = setInterval(() => {
  ws.clients.forEach(client => {
    if (!client.isAlive) return client.terminate();
    client.isAlive = false;
    client.ping();
  });
}, 30000);

// Client side:
ws.onclose = () => {
  setTimeout(() => reconnect(), 3000);
};

This keeps connections alive and auto-reconnects on drops.`
    },
    'Docker Build Failing': {
        missionRole: 'DevOps Engineer',
        missionCompany: 'Microservices',
        errorLog: 'npm ERR! Could not resolve dependency - Requires Node 18+',
        codeSnippet: `FROM node:14
COPY . .
RUN npm install`,
        fullAnswer: `Update the base image to match the required Node version:

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]

Changed node:14 to node:18-alpine (alpine is smaller). Also added WORKDIR and proper COPY order for better Docker layer caching.`
    },
    'API Pagination Missing': {
        missionRole: 'Backend Developer',
        missionCompany: 'User Platform',
        codeSnippet: `app.get('/api/users', async (req, res) => {
  const users = await User.findAll(); // Returns 50,000 users
  res.json(users);
});`,
        fullAnswer: `Implement cursor-based or offset pagination:

app.get('/api/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  const { rows, count } = await User.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
  
  res.json({
    users: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit)
  });
});`
    },
    'Broken Deployment Pipeline': {
        missionRole: 'DevOps Engineer',
        missionCompany: 'Enterprise App',
        errorLog: 'Deploy step: No output. Exit code: 1. Service account token expired.',
        fullAnswer: `Steps to fix the broken deployment:

1. Check CI/CD service account credentials - they've expired
2. Rotate/renew the service account token:
   - Go to cloud provider dashboard
   - Generate new service account key
3. Update the CI/CD secret:
   - Go to GitHub/GitLab Settings → CI/CD → Variables
   - Update DEPLOY_TOKEN with the new key
4. Re-run the pipeline
5. Set up token expiry alerts to prevent future issues`
    }
};

async function updateDevSimulator() {
    console.log('Updating Dev Simulator tasks with fullAnswer and mission data...\n');
    for (const [title, data] of Object.entries(devSimData)) {
        const tasks = await prisma.gamificationTask.findMany({ where: { title } });
        for (const task of tasks) {
            const existing = (task.taskData as any) || {};
            await prisma.gamificationTask.update({
                where: { id: task.id },
                data: {
                    taskData: {
                        ...existing,
                        fullAnswer: data.fullAnswer,
                        errorLog: data.errorLog || existing.errorLog,
                        codeSnippet: data.codeSnippet || existing.codeSnippet,
                        missionRole: data.missionRole,
                        missionCompany: data.missionCompany
                    }
                }
            });
        }
        console.log(`  ✅ ${title}`);
    }
    console.log('\nDone!');
    await prisma.$disconnect();
}

updateDevSimulator().catch(console.error);
