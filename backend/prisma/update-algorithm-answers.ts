import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const algorithmArenaAnswers: Record<string, string> = {
    'Bubble Sort': `function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}
// Result: 1,2,3,5,8,9`,
    'Binary Search': `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}
// binarySearch([1,3,5,7,9,11], 7) => index 3`,
    'Reverse a String': `function reverseString(str) {
  let result = '';
  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }
  return result;
}
// reverseString("hello world") => "dlrow olleh"`,
    'FizzBuzz': `for (let i = 1; i <= 15; i++) {
  if (i % 3 === 0 && i % 5 === 0) console.log("FizzBuzz");
  else if (i % 3 === 0) console.log("Fizz");
  else if (i % 5 === 0) console.log("Buzz");
  else console.log(i);
}
// Number 15 prints: FizzBuzz`,
    'Two Sum': `function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map[complement] !== undefined) {
      return [map[complement], i];
    }
    map[nums[i]] = i;
  }
}
// twoSum([2,7,11,15], 9) => [0, 1]`,
    'Palindrome Check': `function isPalindrome(str) {
  for (let i = 0; i < Math.floor(str.length / 2); i++) {
    if (str[i] !== str[str.length - 1 - i]) return false;
  }
  return true;
}
// isPalindrome("racecar") => yes`,
    'Find Maximum': `function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}
// findMax([34,12,78,56,23,89,45]) => 89`,
    'Remove Duplicates': `function removeDuplicates(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (result.indexOf(arr[i]) === -1) {
      result.push(arr[i]);
    }
  }
  return result;
}
// removeDuplicates([1,2,2,3,4,4,5]) => [1,2,3,4,5]`,
    'Fibonacci Sequence': `function fibonacci(n) {
  const fib = [0, 1];
  for (let i = 2; i < n; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
  }
  return fib;
}
// fibonacci(8) => 0,1,1,2,3,5,8,13`,
    'Merge Sorted Arrays': `function mergeSorted(arr1, arr2) {
  const result = [];
  let i = 0, j = 0;
  while (i < arr1.length && j < arr2.length) {
    if (arr1[i] <= arr2[j]) result.push(arr1[i++]);
    else result.push(arr2[j++]);
  }
  while (i < arr1.length) result.push(arr1[i++]);
  while (j < arr2.length) result.push(arr2[j++]);
  return result;
}
// mergeSorted([1,3,5], [2,4,6]) => [1,2,3,4,5,6]`,
    'Count Vowels': `function countVowels(str) {
  const vowels = 'aeiouAEIOU';
  let count = 0;
  for (const char of str) {
    if (vowels.includes(char)) count++;
  }
  return count;
}
// countVowels("programming is awesome") => 8`,
    'Anagram Check': `function isAnagram(str1, str2) {
  const sorted1 = str1.split('').sort().join('');
  const sorted2 = str2.split('').sort().join('');
  return sorted1 === sorted2;
}
// isAnagram("listen", "silent") => yes`,
    'Selection Sort': `function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}
// First pass places 11 first`,
    'Stack Implementation': `class Stack {
  constructor() { this.items = []; }
  push(val) { this.items.push(val); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
}
// push(1), push(2), push(3), pop() => top is 2`,
    'Queue Implementation': `class Queue {
  constructor() { this.items = []; }
  enqueue(val) { this.items.push(val); }
  dequeue() { return this.items.shift(); }
  front() { return this.items[0]; }
}
// enqueue(A), enqueue(B), enqueue(C), dequeue() => front is B`,
    'Recursion Factorial': `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
// factorial(6) = 6 × 5 × 4 × 3 × 2 × 1 = 720`,
    'Matrix Diagonal Sum': `function diagonalSum(matrix) {
  let sum = 0;
  for (let i = 0; i < matrix.length; i++) {
    sum += matrix[i][i];
  }
  return sum;
}
// diagonalSum([[1,2,3],[4,5,6],[7,8,9]]) => 1+5+9 = 15`,
    'Linked List Cycle': `// Floyd's Tortoise and Hare Algorithm
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
// Answer: B) Floyd's Tortoise and Hare`,
    'Binary Tree Traversal': `function inOrder(node) {
  if (!node) return [];
  return [
    ...inOrder(node.left),
    node.val,
    ...inOrder(node.right)
  ];
}
// In-order: 1,2,3,4,5,6,7`,
    'Quick Sort Partition': `function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}
// Elements before pivot 70: [10,30,40,50] => 4 elements`,
};

async function updateAlgorithmArenaAnswers() {
    console.log('Updating Algorithm Arena tasks with full code answers...\n');

    for (const [title, fullAnswer] of Object.entries(algorithmArenaAnswers)) {
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

    console.log('\nDone!');
    await prisma.$disconnect();
}

updateAlgorithmArenaAnswers().catch(console.error);
