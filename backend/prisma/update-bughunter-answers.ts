import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Full corrected code answers for each Bug Hunter task
const bugHunterAnswers: Record<string, string> = {
    'Off-by-One Loop': `const arr = [1,2,3];
for(let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}`,
    'Missing Return': `function getSum(a, b) {
  const sum = a + b;
  return sum;
}`,
    'String vs Number': `function addNumbers(a, b) {
  return Number(a) + Number(b);
}`,
    'Scope Confusion': `let result;
if (true) {
  result = 42;
}
console.log(result);`,
    'Async Ordering': `console.log("A");
await new Promise(resolve => {
  setTimeout(() => { console.log("B"); resolve(); }, 0);
});
console.log("C");`,
    'Array Mutation': `const original = [3, 1, 2];
const sorted = [...original].sort();
console.log(original);`,
    'Equality Check': `if (0 === false) {
  console.log("equal");
}`,
    'this Keyword': `const button = {
  label: "Submit",
  onClick: function() {
    console.log(this.label);
  }
};
setTimeout(button.onClick.bind(button), 100);`,
    'Null Reference': `const user = { name: "Alice" };
console.log(user.address?.city);`,
    'Floating Point': `const total = 0.1 + 0.2;
if (Math.abs(total - 0.3) < Number.EPSILON) console.log("Match");`,
    'Event Listener Leak': `function openModal() {
  modal.style.display = "block";
  submitBtn.removeEventListener("click", handleSubmit);
  submitBtn.addEventListener("click", handleSubmit);
}`,
    'Race Condition': `let controller;
async function search(query) {
  if (controller) controller.abort();
  controller = new AbortController();
  const res = await fetch("/api/search?q=" + query, { signal: controller.signal });
  const data = await res.json();
  renderResults(data);
}`,
    'Promise Rejection': `async function fetchUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}`,
    'Infinite Loop': `let i = 10;
while (i > 0) {
  console.log(i);
  i--;
}`,
    'Closure Trap': `for (let i = 0; i < 5; i++) {
  buttons[i].onclick = function() { alert(i); };
}`,
    'JSON Parse Error': `const data = JSON.parse('{"name": "Alice"}');
console.log(data.name);`,
    'CSS Class Toggle': `btn.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
});`,
    'Debounce Missing': `let timeout;
input.addEventListener("input", (e) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    fetch(\`/api/search?q=\${e.target.value}\`);
  }, 300);
});`,
    'Map Key Error': `items.map((item) => (
  <li key={item.id}>{item.name}</li>
));`,
    'Memory Leak': `useEffect(() => {
  const interval = setInterval(() => fetchData(), 5000);
  return () => clearInterval(interval);
}, []);`,
};

async function updateBugHunterAnswers() {
    console.log('Updating Bug Hunter tasks with full code answers...\n');

    for (const [title, fullAnswer] of Object.entries(bugHunterAnswers)) {
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
                        fullAnswer: fullAnswer
                    }
                }
            });
        }
        console.log(`  ✅ ${title}`);
    }

    console.log('\nDone! All Bug Hunter tasks now have full code answers.');
    await prisma.$disconnect();
}

updateBugHunterAnswers().catch(console.error);
