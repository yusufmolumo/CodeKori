import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Updates every bug-hunter and dev-simulator task with a proper fullAnswer
 * and expanded expectedKeywords so that:
 * 1. "Show Answer" displays a clean, complete, copy-paste-ready answer
 * 2. Multiple valid phrasings of the answer are accepted
 */

const bugHunterAnswers: Record<string, { fullAnswer: string; expectedKeywords: string[] }> = {
    'Off-by-One Loop': {
        fullAnswer: 'i < arr.length',
        expectedKeywords: ['i < arr.length', '< arr.length', 'i <', 'less than', 'remove =', 'i < 3', 'off by one']
    },
    'Missing Return': {
        fullAnswer: 'return sum',
        expectedKeywords: ['return', 'return sum', 'return a + b', 'return value', 'missing return']
    },
    'String vs Number': {
        fullAnswer: 'return Number(a) + Number(b)',
        expectedKeywords: ['parseInt', 'Number', 'parseFloat', '+a', '+b', 'Number(a)', 'Number(b)', 'parseInt(a)', 'parseInt(b)', 'convert', 'type conversion', 'cast']
    },
    'Scope Confusion': {
        fullAnswer: 'let result = 42; should be declared before the if block',
        expectedKeywords: ['let result', 'var result', 'outside', 'before', 'block scope', 'move declaration', 'declare before', 'declare outside']
    },
    'Async Ordering': {
        fullAnswer: 'setTimeout is asynchronous and runs after the synchronous code due to the event loop',
        expectedKeywords: ['event loop', 'async', 'asynchronous', 'setTimeout', 'callback queue', 'microtask', 'synchronous', 'call stack', 'non-blocking']
    },
    'Array Mutation': {
        fullAnswer: 'const sorted = [...original].sort()',
        expectedKeywords: ['slice', 'spread', '[...original]', 'Array.from', 'toSorted', '.slice()', 'copy', 'clone', 'new array', 'spread operator']
    },
    'Equality Check': {
        fullAnswer: 'Use === instead of == to check strict equality',
        expectedKeywords: ['===', 'strict equality', 'triple equals', 'type coercion', 'strict', 'identity operator', 'strict comparison']
    },
    'this Keyword': {
        fullAnswer: 'setTimeout(button.onClick.bind(button), 100) or use an arrow function',
        expectedKeywords: ['bind', 'arrow function', '() =>', '.bind(button)', 'bind(this)', 'lexical this', 'arrow', 'context', 'this context']
    },
    'Null Reference': {
        fullAnswer: 'user.address?.city',
        expectedKeywords: ['optional chaining', '?.', 'user.address?.city', 'if (user.address)', 'null check', '&&', 'user.address &&', 'undefined check', 'nullish']
    },
    'Floating Point': {
        fullAnswer: 'parseFloat((0.1 + 0.2).toFixed(1))',
        expectedKeywords: ['toFixed', 'Math.round', 'epsilon', 'multiply', '* 100', 'precision', 'floating point', 'Number.EPSILON', 'rounding']
    },
    'Event Listener Leak': {
        fullAnswer: 'submitBtn.removeEventListener("click", handleSubmit) before adding a new one',
        expectedKeywords: ['removeEventListener', 'once', 'AbortController', 'remove', 'cleanup', 'named function', '{ once: true }']
    },
    'Race Condition': {
        fullAnswer: 'Use AbortController to cancel previous requests before starting new ones',
        expectedKeywords: ['AbortController', 'abort', 'cancel', 'debounce', 'latest', 'abort signal', 'AbortSignal', 'cancel previous', 'ignore stale']
    },
    'Promise Rejection': {
        fullAnswer: 'try { const res = await fetch(...); } catch (error) { handle error }',
        expectedKeywords: ['try', 'catch', '.catch', 'error handling', 'try/catch', 'try catch', 'handle error', 'error boundary']
    },
    'Infinite Loop': {
        fullAnswer: 'i--',
        expectedKeywords: ['i--', 'decrement', 'i -= 1', 'decrease', 'i = i - 1', 'minus', 'subtract']
    },
    'Closure Trap': {
        fullAnswer: 'Change var to let in the for loop: for (let i = 0; i < 5; i++)',
        expectedKeywords: ['let', 'closure', 'IIFE', 'block scope', 'let i', 'for (let', 'block scoping', 'immediately invoked']
    },
    'JSON Parse Error': {
        fullAnswer: 'JSON.parse(\'{"name": "Alice"}\')',
        expectedKeywords: ['"name"', 'double quotes', 'valid JSON', '"Alice"', 'quotes', 'property names', 'string quotes', 'JSON format']
    },
    'CSS Class Toggle': {
        fullAnswer: 'body.classList.toggle("dark-mode")',
        expectedKeywords: ['classList.toggle', 'toggle', 'classList', 'toggle()', 'classList.toggle(', 'class toggle']
    },
    'Debounce Missing': {
        fullAnswer: 'let timer; input.addEventListener("input", (e) => { clearTimeout(timer); timer = setTimeout(() => fetch(...), 300); })',
        expectedKeywords: ['debounce', 'setTimeout', 'clearTimeout', 'delay', 'throttle', 'wait', 'timer', 'lodash.debounce']
    },
    'Map Key Error': {
        fullAnswer: 'key={item.id}',
        expectedKeywords: ['key={item.id}', 'unique key', 'stable key', 'item.id', 'unique identifier', 'key prop', 'stable identifier', 'key={item']
    },
    'Memory Leak': {
        fullAnswer: 'useEffect(() => { const interval = setInterval(() => fetchData(), 5000); return () => clearInterval(interval); }, [])',
        expectedKeywords: ['clearInterval', 'cleanup', 'return () =>', 'useEffect cleanup', 'cleanup function', 'return () => clearInterval', 'unmount', 'clear interval']
    },
};

const devSimulatorAnswers: Record<string, { fullAnswer: string; expectedKeywords: string[] }> = {
    'Login System Failing': {
        fullAnswer: 'bcrypt.compare(password, user.passwordHash)',
        expectedKeywords: ['user.passwordHash', 'hash', 'second argument', 'bcrypt.compare(password, user', 'user.password', 'stored hash', 'compare(password, hash)', 'two arguments']
    },
    'Broken Checkout Flow': {
        fullAnswer: 'user.paymentMethod is undefined - add optional chaining: user.paymentMethod?.id',
        expectedKeywords: ['paymentMethod', 'user.paymentMethod', 'null check', 'optional chaining', 'undefined', '?.', 'if (user.paymentMethod)', 'check if exists']
    },
    'Memory Leak in Dashboard': {
        fullAnswer: 'return () => clearInterval(interval)',
        expectedKeywords: ['clearInterval', 'cleanup', 'return', 'unmount', 'cleanup function', 'return () =>', 'clear interval', 'useEffect cleanup']
    },
    'CORS Blocking API': {
        fullAnswer: 'app.use(cors({ origin: "http://localhost:3000" }))',
        expectedKeywords: ['cors', 'middleware', 'app.use(cors', 'origin', 'cors()', 'cors middleware', 'npm cors', 'Access-Control']
    },
    'Database Connection Pool': {
        fullAnswer: 'Use a connection pool with a singleton pattern to reuse database connections',
        expectedKeywords: ['connection pool', 'pool', 'reuse', 'singleton', 'max connections', 'pooling', 'shared connection', 'pool size']
    },
    'Missing Index': {
        fullAnswer: 'CREATE INDEX idx_orders_user_id ON orders(user_id)',
        expectedKeywords: ['CREATE INDEX', 'index', 'user_id', 'add index', 'database index', 'idx_', 'ON orders', 'indexing']
    },
    'JWT Expired Token': {
        fullAnswer: 'Implement refresh tokens with a longer-lived refresh token and short-lived access token',
        expectedKeywords: ['refresh token', 'refresh', 'longer expiry', 'token rotation', 'refresh token flow', 'access token', 'token refresh', 'renew token']
    },
    'N+1 Query Problem': {
        fullAnswer: 'const posts = await Post.findAll({ include: User })',
        expectedKeywords: ['include', 'join', 'eager loading', 'findAll({ include', 'IN clause', 'eager load', 'JOIN', 'batch', 'preload']
    },
    'XSS Vulnerability': {
        fullAnswer: 'element.textContent = userComment',
        expectedKeywords: ['sanitize', 'textContent', 'escape', 'DOMPurify', 'innerText', 'sanitization', 'encode', 'html entities', 'xss prevention']
    },
    'Broken Image Upload': {
        fullAnswer: 'app.use(express.static("uploads"))',
        expectedKeywords: ['uploads', 'express.static("uploads")', 'static', 'path', 'static files', 'serve uploads', 'express.static', 'public folder']
    },
    'Race Condition in Counter': {
        fullAnswer: 'await Post.updateOne({ _id: id }, { $inc: { likes: 1 } })',
        expectedKeywords: ['atomic', 'increment', '$inc', 'transaction', 'optimistic locking', 'atomic operation', 'atomic update', 'lock', 'concurrent']
    },
    'Environment Variable Missing': {
        fullAnswer: 'Set JWT_SECRET in the Render dashboard environment variables settings',
        expectedKeywords: ['environment variable', 'Render dashboard', 'config vars', 'set env', 'production env', 'env vars', 'dashboard settings', 'platform config']
    },
    'Infinite Re-render': {
        fullAnswer: 'useEffect(() => { fetchUser(); }, [])',
        expectedKeywords: ['useEffect', 'effect', 'dependency', 'infinite loop', 'render cycle', 'useEffect()', 'dependency array', 'empty array', '[]']
    },
    'SSL Certificate Error': {
        fullAnswer: 'Renew the SSL certificate using certbot or your certificate provider',
        expectedKeywords: ['renew', 'certificate', 'SSL', "Let's Encrypt", 'certbot', 'renewal', 'ssl cert', 'renew certificate', 'cert renewal']
    },
    'Slow API Response': {
        fullAnswer: 'const [q1, q2, q3, q4, q5] = await Promise.all([query1(), query2(), query3(), query4(), query5()])',
        expectedKeywords: ['Promise.all', 'parallel', 'concurrent', 'async', 'await Promise.all', 'run in parallel', 'concurrently', 'Promise.allSettled']
    },
    'Git Merge Conflict': {
        fullAnswer: 'Remove the conflict markers (<<<<<<<, =======, >>>>>>>) and choose the correct code, then git add and git commit',
        expectedKeywords: ['choose', 'edit', 'remove markers', 'conflict markers', 'resolve', 'git add', 'manual resolve', 'pick one', 'merge resolution']
    },
    'Websocket Disconnect': {
        fullAnswer: 'Implement a ping/pong heartbeat mechanism to keep the connection alive',
        expectedKeywords: ['ping', 'pong', 'heartbeat', 'keepalive', 'reconnect', 'keep alive', 'ping pong', 'ws.ping', 'connection alive']
    },
    'Docker Build Failing': {
        fullAnswer: 'FROM node:18',
        expectedKeywords: ['node:18', 'node:20', 'FROM node:18', 'update', 'base image', 'node version', 'FROM node:20', 'upgrade node', 'node image']
    },
    'API Pagination Missing': {
        fullAnswer: 'Add limit and offset parameters: SELECT * FROM users LIMIT 20 OFFSET 0',
        expectedKeywords: ['pagination', 'limit', 'offset', 'page', 'cursor', 'skip', 'take', 'page size', 'paginate', 'per page']
    },
    'Broken Deployment Pipeline': {
        fullAnswer: 'Rotate the expired service account token and update the credentials in the CI/CD secret variables',
        expectedKeywords: ['token', 'credentials', 'service account', 'expired', 'rotate', 'secret', 'renew token', 'update credentials', 'new token']
    },
};

async function updateTaskAnswers() {
    console.log('📝 Updating bug-hunter and dev-simulator task answers...');

    // Get all modes
    const bugHunterMode = await prisma.gamificationMode.findUnique({ where: { slug: 'bug-hunter' } });
    const devSimulatorMode = await prisma.gamificationMode.findUnique({ where: { slug: 'dev-simulator' } });

    if (!bugHunterMode || !devSimulatorMode) {
        console.error('❌ Could not find bug-hunter or dev-simulator modes');
        return;
    }

    // Update bug-hunter tasks
    const bugHunterTasks = await prisma.gamificationTask.findMany({ where: { modeId: bugHunterMode.id } });
    let updated = 0;
    for (const task of bugHunterTasks) {
        const answers = bugHunterAnswers[task.title];
        if (answers) {
            const existingData = (task.taskData as any) || {};
            await prisma.gamificationTask.update({
                where: { id: task.id },
                data: {
                    taskData: {
                        ...existingData,
                        fullAnswer: answers.fullAnswer,
                        expectedKeywords: answers.expectedKeywords,
                    }
                }
            });
            updated++;
            console.log(`  ✅ Bug Hunter: ${task.title}`);
        } else {
            console.log(`  ⚠️ No answer mapping for: ${task.title}`);
        }
    }

    // Update dev-simulator tasks
    const devSimulatorTasks = await prisma.gamificationTask.findMany({ where: { modeId: devSimulatorMode.id } });
    for (const task of devSimulatorTasks) {
        const answers = devSimulatorAnswers[task.title];
        if (answers) {
            const existingData = (task.taskData as any) || {};
            await prisma.gamificationTask.update({
                where: { id: task.id },
                data: {
                    taskData: {
                        ...existingData,
                        fullAnswer: answers.fullAnswer,
                        expectedKeywords: answers.expectedKeywords,
                    }
                }
            });
            updated++;
            console.log(`  ✅ Dev Simulator: ${task.title}`);
        } else {
            console.log(`  ⚠️ No answer mapping for: ${task.title}`);
        }
    }

    console.log(`\n🎉 Updated ${updated} tasks with full answers and expanded keywords!`);
}

updateTaskAnswers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
