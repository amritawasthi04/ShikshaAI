import { DetailedLessonModule } from "./types";

export const backendModules: Record<string, DetailedLessonModule> = {
  // Phase 1.1: Event Loop Mechanics & Asynchronous I/O
  "event_loop_async_io": {
    topicId: "be_1_1",
    title: "Event Loop Mechanics & Asynchronous I/O",
    subtitle: "Libuv, epoll/kqueue non-blocking system calls, thread pools, and microtasks.",
    domain: "Backend Systems & Database Architecture",
    phaseName: "Foundation",
    duration: "35m",
    type: "concept",
    keyObjectives: [
      "Deconstruct non-blocking I/O multiplexing with OS primitives (epoll on Linux, kqueue on macOS).",
      "Trace the Node.js / Libuv event loop phases: Timers, Pending I/O, Poll, Check (setImmediate), and Close.",
      "Distinguish Microtasks (process.nextTick, Promise.then) from Macrotasks (setTimeout, setImmediate).",
      "Prevent event loop starvation from CPU-bound computation and sync methods.",
    ],
    deepDive: {
      overview:
        "High-concurrency servers handle tens of thousands of concurrent connections using single-threaded event loops combined with operating system non-blocking I/O multiplexing. Instead of spawning an OS thread per connection (which exhausts memory through thread stack allocations), epoll notifies the event loop when a socket buffer has bytes ready to read.",
      mentalModel:
        "Think of a restaurant waiter. In a thread-per-request model, each waiter sits at a table and stares at the customers until they finish their meal. In an event loop model, one waiter takes orders, hands them to the kitchen (OS kernel), and moves to other tables, returning only when the kitchen bell rings.",
      coreConcepts: [
        {
          title: "Microtask Queue Priority",
          description:
            "Microtasks (Promises, process.nextTick) execute immediately after the current synchronous script and between every event loop macrotask phase, before any timer or I/O callback runs.",
          highlight: "An infinite Promise resolution loop or recursive nextTick will starve I/O and freeze the entire server.",
        },
      ],
      pitfalls: [
        "Running heavy JSON.parse() on 50MB strings or crypto hash loops on the main thread, blocking all incoming HTTP connections.",
      ],
      realWorldApplications:
        "High-scale messaging gateways (Discord, WhatsApp), real-time game servers, and microservice reverse proxies.",
    },
    codeBlueprint: {
      language: "typescript",
      languageBadge: "TypeScript • Node.js Runtime",
      filename: "eventLoopPhases.ts",
      code: `import fs from "fs";

console.log("1. Synchronous Main Thread Execution");

// Macrotask: Timers Phase
setTimeout(() => console.log("4. setTimeout Callback (Timers Phase)"), 0);

// Macrotask: Check Phase
setImmediate(() => console.log("5. setImmediate Callback (Check Phase)"));

// Microtask Queue (Executes before any next phase)
Promise.resolve().then(() => console.log("3. Promise Microtask"));
process.nextTick(() => console.log("2. process.nextTick Microtask (Top Priority)"));

// Non-blocking I/O polling
fs.readFile(__filename, () => {
  console.log("6. File I/O Completed (Poll Phase)");
  // Inside I/O callbacks, setImmediate is guaranteed to run before setTimeout
  setImmediate(() => console.log("7. Nested setImmediate inside I/O"));
  setTimeout(() => console.log("8. Nested setTimeout inside I/O"), 0);
});`,
      explanation: "Proves the deterministic order of execution across process.nextTick, Promise microtasks, and Libuv loop phases.",
    },
    quizQuestions: [
      {
        question: "When do Promise microtask callbacks execute relative to event loop phases?",
        options: [
          "Immediately after the current operation finishes, before the event loop advances to the next phase.",
          "Only when the server is idle with zero connections.",
          "At the end of every 100 milliseconds.",
          "Inside the thread pool worker threads.",
        ],
        correctIndex: 0,
        explanation:
          "The microtask queue drains immediately upon completion of the active synchronous execution call stack.",
      },
    ],
    resources: [
      {
        title: "Node.js Official Documentation: The Event Loop, Timers, and process.nextTick()",
        url: "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/",
        type: "documentation",
        description: "Authoritative architectural documentation on event loop phases.",
      },
    ],
  },

  // Phase 2.2: Transaction Isolation Levels
  "transaction_isolation_levels": {
    topicId: "be_2_2",
    title: "Transaction Isolation Levels (Read Committed to Serializable)",
    subtitle: "Dirty reads, non-repeatable reads, phantom reads, and MVCC snapshot isolation.",
    domain: "Backend Systems & Database Architecture",
    phaseName: "Core Skills",
    duration: "45m",
    type: "exercise",
    keyObjectives: [
      "Understand the ANSI SQL Isolation Levels: Read Uncommitted, Read Committed, Repeatable Read, and Serializable.",
      "Analyze Multi-Version Concurrency Control (MVCC) in PostgreSQL using xmin, xmax, and tuple versions.",
      "Identify concurrency anomalies: Dirty Reads, Non-Repeatable Reads, Phantom Reads, and Write Skew.",
      "Implement optimistic and pessimistic locking (SELECT FOR UPDATE) in financial ledgers.",
    ],
    deepDive: {
      overview:
        "ACID transactions ensure that concurrent database operations do not corrupt shared state. Higher isolation levels prevent concurrency anomalies but increase lock contention and serialization abort retries.",
      mentalModel:
        "Think of MVCC like taking photographs. In Read Committed, you take a new photo every time you open your eyes (each query gets the latest committed view). In Repeatable Read, you look at a single photograph taken at the exact millisecond your transaction began.",
      coreConcepts: [
        {
          title: "Write Skew Anomaly",
          description:
            "Write skew occurs when two concurrent transactions read overlapping data, satisfy their local constraints, and update non-overlapping rows in a way that violates a global invariant. Repeatable Read does NOT prevent write skew; only Serializable or explicit row locks do.",
          highlight: "Financial balances and medical shift schedules require Serializable isolation or SELECT FOR UPDATE.",
        },
      ],
      pitfalls: [
        "Failing to implement retry logic for 40001 serialization_failure errors when using Serializable transactions.",
      ],
      realWorldApplications:
        "Stripe payments processing, banking account balances, inventory reservation during flash sales.",
    },
    codeBlueprint: {
      language: "sql",
      languageBadge: "PostgreSQL 16 • SQL",
      filename: "pessimistic_locking.sql",
      code: `-- 1. Begin atomic transaction with strict row-level lock
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 2. Select balance with exclusive write lock to prevent race conditions
SELECT balance FROM accounts 
WHERE account_id = 'acc_101' 
FOR UPDATE;

-- 3. Verify balance > transfer_amount in application logic, then debit
UPDATE accounts 
SET balance = balance - 100.00,
    updated_at = NOW()
WHERE account_id = 'acc_101';

-- 4. Credit recipient account
UPDATE accounts 
SET balance = balance + 100.00,
    updated_at = NOW()
WHERE account_id = 'acc_202';

-- 5. Commit changes atomically
COMMIT;`,
      explanation: "Applies SELECT FOR UPDATE row-level pessimistic locking to guarantee atomic ledger balance transfers.",
    },
    quizQuestions: [
      {
        question: "Which concurrency anomaly can still occur under Repeatable Read isolation in PostgreSQL?",
        options: [
          "Write Skew, where concurrent updates violate a joint constraint across distinct rows.",
          "Dirty Reads, reading uncommitted changes.",
          "Non-repeatable reads.",
          "Lost updates to the exact same row.",
        ],
        correctIndex: 0,
        explanation:
          "Repeatable Read prevents dirty reads, non-repeatable reads, and phantom reads in Postgres MVCC, but write skew requires Serializable.",
      },
    ],
    resources: [
      {
        title: "PostgreSQL Documentation: Transaction Isolation",
        url: "https://www.postgresql.org/docs/current/transaction-iso.html",
        type: "documentation",
        description: "Official manual on MVCC snapshot isolation and SSI (Serializable Snapshot Isolation).",
      },
    ],
  },

  // Phase 3.1: Redis Cache Invalidation & Stampede Mitigation
  "redis_cache_invalidation_stampede": {
    topicId: "be_3_1",
    title: "Redis Cache Invalidation & Stampede Mitigation",
    subtitle: "Cache-Aside, Write-Through, probabilistic early expiration (XFetch), and distributed mutex locks.",
    domain: "Backend Systems & Database Architecture",
    phaseName: "Advanced Topics",
    duration: "40m",
    type: "concept",
    keyObjectives: [
      "Implement the Cache-Aside (Lazy Loading) pattern with deterministic TTL invalidation.",
      "Mitigate Cache Stampede (Thundering Herd) when high-traffic hot keys expire simultaneously.",
      "Implement probabilistic early recomputation (XFetch algorithm) and distributed mutexes (Redlock).",
      "Structure Redis data types: Strings, Hashes, Sorted Sets (ZSET), and HyperLogLog.",
    ],
    deepDive: {
      overview:
        "Caching in memory reduces database queries from milliseconds to microseconds. However, when a hot key expires in a system receiving 10,000 requests/sec, all concurrent requests miss the cache and hit the database simultaneously, causing a catastrophic Cache Stampede.",
      mentalModel:
        "Imagine a popular buffet station where the chef replaces a tray every 15 minutes. When the tray empties, 500 hungry people rush into the kitchen at once. Cache stampede mitigation appoints one designated person to fetch food while the others wait patiently.",
      coreConcepts: [
        {
          title: "Probabilistic Early Expiration (XFetch)",
          description:
            "Instead of waiting for a key to strictly expire at TTL = 0, background workers calculate a probability of refreshing the key early: -beta * delta * ln(random()) > (expiry - now).",
          highlight: "Hot keys are recalculated asynchronously in the background before they ever expire in the cache.",
        },
      ],
      pitfalls: [
        "Setting static, identical TTLs across millions of keys, causing them all to expire at the exact same second.",
      ],
      realWorldApplications:
        "Twitter/X timeline caching, Netflix video metadata caching, e-commerce product catalogs.",
    },
    codeBlueprint: {
      language: "typescript",
      languageBadge: "TypeScript • Redis / IORedis",
      filename: "cacheAsideMutex.ts",
      code: `import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export async function getWithStampedeProtection<T>(
  key: string,
  fetchFromDb: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // 1. Attempt cache read
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Cache miss: Acquire distributed mutex lock with 5-second lease
  const lockKey = \`lock:\${key}\`;
  const acquiredLock = await redis.set(lockKey, "locked", "EX", 5, "NX");

  if (acquiredLock === "OK") {
    try {
      // Current worker recomputes data from database
      const freshData = await fetchFromDb();
      // Add random jitter (±10%) to prevent simultaneous expiration
      const jitteredTtl = ttlSeconds + Math.floor(Math.random() * 30);
      await redis.set(key, JSON.stringify(freshData), "EX", jitteredTtl);
      return freshData;
    } finally {
      await redis.del(lockKey);
    }
  } else {
    // 3. Another worker is computing; wait 50ms and retry reading cache
    await new Promise((resolve) => setTimeout(resolve, 50));
    return getWithStampedeProtection(key, fetchFromDb, ttlSeconds);
  }
}`,
      explanation: "Distributed Redis mutex lock using SET NX EX preventing hundreds of concurrent requests from overwhelming the primary database on cache miss.",
    },
    quizQuestions: [
      {
        question: "How does adding random jitter to cache TTLs help prevent system outages?",
        options: [
          "It spreads key expirations across time so millions of cached items do not simultaneously expire at the same second.",
          "It encrypts cached data against unauthorized access.",
          "It reduces Redis RAM consumption by 50%.",
          "It forces Redis to use LRU eviction.",
        ],
        correctIndex: 0,
        explanation:
          "Adding a random jitter of ±10-20% prevents synchronized expiration spikes that cause database thundering herds.",
      },
    ],
    resources: [
      {
        title: "Redis Documentation: Distributed Locks with Redlock",
        url: "https://redis.io/docs/manual/patterns/distributed-locks/",
        type: "documentation",
        description: "Official guide on distributed locking and mutual exclusion.",
      },
    ],
  },
};
