import { AssessmentQuestionWithAnswer } from "@/types/assessment";

/**
 * Curated, technically accurate Question Bank organized by technical domain and phase types.
 * Each phase contains comprehensive 10-question MCQ pools with correct answers and detailed explanations.
 */
export const PHASE_QUESTION_BANKS: Record<string, AssessmentQuestionWithAnswer[]> = {
  // =========================================================================
  // 1. FULL-STACK / WEB DEVELOPMENT: PHASE 1 (Foundation)
  // =========================================================================
  "fullstack_1": [
    {
      id: "fs1_q1",
      question: "Which HTML5 semantic element is most appropriate for containing the primary unique content of a webpage?",
      options: ["<section>", "<main>", "<article>", "<div>"],
      correctOptionIndex: 1,
      explanation: "The <main> element represents the dominant, unique content of the <body> of a document. It should not be duplicated within a document.",
      category: "HTML5 & Semantics",
      difficulty: "beginner",
    },
    {
      id: "fs1_q2",
      question: "In CSS Flexbox, which property aligns items along the cross axis (perpendicular to flex-direction)?",
      options: ["justify-content", "align-items", "flex-wrap", "align-content"],
      correctOptionIndex: 1,
      explanation: "align-items specifies the default alignment for items along the cross axis, whereas justify-content aligns items along the main axis.",
      category: "CSS Layouts",
      difficulty: "beginner",
    },
    {
      id: "fs1_q3",
      question: "What is the key difference between 'let' and 'var' in modern JavaScript (ES6+)?",
      options: [
        "'let' is block-scoped, while 'var' is function-scoped",
        "'var' cannot be reassigned, while 'let' can be reassigned",
        "'let' variables are hoisted and initialized with undefined",
        "'let' is only available in asynchronous functions",
      ],
      correctOptionIndex: 0,
      explanation: "'let' is block-scoped and exists in the Temporal Dead Zone until initialized, whereas 'var' is function-scoped and hoisted with an initial value of undefined.",
      category: "JavaScript Core",
      difficulty: "beginner",
    },
    {
      id: "fs1_q4",
      question: "Which JavaScript array method returns a brand-new array containing only elements that satisfy a provided predicate function?",
      options: ["map()", "filter()", "reduce()", "forEach()"],
      correctOptionIndex: 1,
      explanation: "Array.prototype.filter() creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that pass the test.",
      category: "JavaScript Core",
      difficulty: "beginner",
    },
    {
      id: "fs1_q5",
      question: "What does the 'rem' unit in CSS represent relative to?",
      options: [
        "The font size of the immediate parent element",
        "The font size of the root <html> element",
        "The viewport width",
        "The height of the current line-height",
      ],
      correctOptionIndex: 1,
      explanation: "'rem' stands for 'root em' and is calculated relative to the font-size of the root <html> element (by default 16px in most browsers).",
      category: "CSS Units",
      difficulty: "beginner",
    },
    {
      id: "fs1_q6",
      question: "In Git, which command creates a new branch and immediately switches your working directory to it?",
      options: ["git branch -b <name>", "git switch -c <name>", "git merge <name>", "git stash push <name>"],
      correctOptionIndex: 1,
      explanation: "'git switch -c <name>' (or 'git checkout -b <name>') creates a new branch and immediately checks it out.",
      category: "Version Control",
      difficulty: "beginner",
    },
    {
      id: "fs1_q7",
      question: "What is the return value of JavaScript's 'typeof null' due to historical legacy reasons?",
      options: ["'null'", "'undefined'", "'object'", "'boolean'"],
      correctOptionIndex: 2,
      explanation: "In JavaScript, 'typeof null' evaluates to 'object'. This is a well-known legacy quirk of the original JavaScript implementation.",
      category: "JavaScript Internals",
      difficulty: "intermediate",
    },
    {
      id: "fs1_q8",
      question: "What is Event Bubbling in the browser Document Object Model (DOM)?",
      options: [
        "Events propagate from the window down to the target element",
        "Events propagate from the target element upward through its ancestors in the DOM tree",
        "Events are executed in parallel across worker threads",
        "Events are automatically cancelled when an error occurs",
      ],
      correctOptionIndex: 1,
      explanation: "Event bubbling is the phase where an event triggers on the innermost target element and then successively bubbles up through its ancestor elements to the document root.",
      category: "DOM & Events",
      difficulty: "intermediate",
    },
    {
      id: "fs1_q9",
      question: "Which of the following is an immutable primitive type in JavaScript?",
      options: ["Array", "Object", "Symbol", "Function"],
      correctOptionIndex: 2,
      explanation: "JavaScript primitives (String, Number, BigInt, Boolean, Undefined, Symbol, Null) are immutable values. Arrays, Objects, and Functions are reference types.",
      category: "JavaScript Core",
      difficulty: "beginner",
    },
    {
      id: "fs1_q10",
      question: "What is the purpose of the HTTP 'Content-Type' header in an API response?",
      options: [
        "Specifies the encoding compression algorithm (e.g., gzip)",
        "Indicates the MIME media type of the resource payload (e.g., application/json)",
        "Defines Cross-Origin Resource Sharing permissions",
        "Sets the authentication bearer token",
      ],
      correctOptionIndex: 1,
      explanation: "The Content-Type representation header is used to indicate the original media type (MIME type) of the resource prior to any encoding.",
      category: "Web Protocols",
      difficulty: "beginner",
    },
  ],

  // =========================================================================
  // 2. FULL-STACK: PHASE 2 (Core Skills — React & Frontend Architecture)
  // =========================================================================
  "fullstack_2": [
    {
      id: "fs2_q1",
      question: "In React, why must state updates using the previous state be written with an updater function: setState((prev) => ...)?",
      options: [
        "To ensure state updates run synchronously",
        "Because state updates in React are batched and asynchronous, guaranteeing access to the latest state value",
        "To prevent React from re-rendering the component",
        "Because React forbids passing primitive values directly to setState",
      ],
      correctOptionIndex: 1,
      explanation: "Because React state updates are batched and scheduled asynchronously, using the updater function form guarantees you are computing the next state from the most recent pending state.",
      category: "React Core",
      difficulty: "intermediate",
    },
    {
      id: "fs2_q2",
      question: "When does the cleanup function returned inside a 'useEffect' hook execute?",
      options: [
        "Only when the entire browser window is refreshed",
        "Before the component re-runs the effect on dependency change, and upon component unmounting",
        "Immediately after the component finishes rendering its JSX",
        "Only when an unhandled runtime error is caught by an Error Boundary",
      ],
      correctOptionIndex: 1,
      explanation: "React executes the cleanup function before executing the effect on the next render (if dependencies changed) and when the component unmounts from the DOM.",
      category: "React Hooks",
      difficulty: "intermediate",
    },
    {
      id: "fs2_q3",
      question: "What is the primary purpose of React's 'useMemo' hook?",
      options: [
        "To memoize a callback function reference across re-renders",
        "To cache and memoize the computed result of an expensive calculation between renders",
        "To persist data directly to browser localStorage",
        "To trigger a re-render whenever a reference changes",
      ],
      correctOptionIndex: 1,
      explanation: "useMemo caches the calculated result of an expensive computation and only recalculates it when one of its specified dependencies changes.",
      category: "React Performance",
      difficulty: "intermediate",
    },
    {
      id: "fs2_q4",
      question: "In TypeScript, what is the key difference between 'interface' and 'type' alias?",
      options: [
        "Interfaces support declaration merging (open for extension), while type aliases do not",
        "Type aliases can only be used with primitive numbers",
        "Interfaces cannot define object properties",
        "Type aliases are evaluated only at JavaScript runtime",
      ],
      correctOptionIndex: 0,
      explanation: "Interfaces in TypeScript are open and support declaration merging, allowing multiple declarations with the same name to merge their members. Type aliases cannot be reopened.",
      category: "TypeScript",
      difficulty: "intermediate",
    },
    {
      id: "fs2_q5",
      question: "What problem does the Virtual DOM solve in modern frontend libraries like React?",
      options: [
        "It executes JavaScript code on a dedicated GPU thread",
        "It minimizes costly direct real-DOM manipulations by computing efficient diffs in memory",
        "It replaces the browser's CSS rendering engine entirely",
        "It converts JSX directly into compiled WebAssembly bytecode",
      ],
      correctOptionIndex: 1,
      explanation: "The Virtual DOM is an in-memory lightweight representation of the UI. React reconciles virtual trees to batch and apply minimal, efficient real-DOM mutations.",
      category: "React Architecture",
      difficulty: "intermediate",
    },
    {
      id: "fs2_q6",
      question: "Which Tailwind CSS class applies a horizontal padding of 1.5rem (24px)?",
      options: ["py-6", "px-6", "p-6", "m-6"],
      correctOptionIndex: 1,
      explanation: "In Tailwind CSS, 'px-6' applies padding-left: 1.5rem and padding-right: 1.5rem (where 1 unit = 0.25rem = 4px, so 6 * 4px = 24px = 1.5rem).",
      category: "Tailwind CSS",
      difficulty: "beginner",
    },
    {
      id: "fs2_q7",
      question: "What is the purpose of the 'key' prop when rendering lists of dynamic items in React?",
      options: [
        "To automatically generate CSS class names for list items",
        "To provide a unique identity so React's reconciler can track, reorder, or remove specific elements efficiently",
        "To bind keyboard shortcuts to list elements",
        "To secure list item data with encryption",
      ],
      correctOptionIndex: 1,
      explanation: "Keys help React identify which items have changed, been added, or been removed. Without stable keys, React may re-render or incorrectly reuse DOM node state.",
      category: "React Reconciler",
      difficulty: "beginner",
    },
    {
      id: "fs2_q8",
      question: "In Next.js App Router, what is the default rendering behavior of components in the 'app/' directory unless marked with 'use client'?",
      options: [
        "Client-side rendered Single Page Application (CSR)",
        "React Server Components (RSC) rendered on the server",
        "Static HTML generated with PHP",
        "Compiled into Service Workers",
      ],
      correctOptionIndex: 1,
      explanation: "In Next.js App Router, all components inside the app directory are React Server Components by default, reducing client JavaScript bundle size.",
      category: "Next.js App Router",
      difficulty: "intermediate",
    },
    {
      id: "fs2_q9",
      question: "What is the primary benefit of custom React Hooks?",
      options: [
        "They allow components to render without JSX",
        "They encapsulate and reuse stateful logic and side effects across multiple components cleanly",
        "They bypass React's standard component lifecycle",
        "They replace the need for TypeScript interfaces",
      ],
      correctOptionIndex: 1,
      explanation: "Custom hooks allow developers to extract component logic into reusable functions, sharing stateful behavior without changing component hierarchy.",
      category: "React Hooks",
      difficulty: "intermediate",
    },
    {
      id: "fs2_q10",
      question: "Which TypeScript utility type constructs a type with all properties of 'T' set to optional?",
      options: ["Required<T>", "Partial<T>", "Readonly<T>", "Record<K, T>"],
      correctOptionIndex: 1,
      explanation: "Partial<T> returns a new type where all properties of interface/type T are marked as optional (?).",
      category: "TypeScript",
      difficulty: "beginner",
    },
  ],

  // =========================================================================
  // 3. FULL-STACK: PHASE 3 (Advanced Topics — Backend, APIs & Databases)
  // =========================================================================
  "fullstack_3": [
    {
      id: "fs3_q1",
      question: "What is the primary purpose of database Indexing in relational databases like PostgreSQL?",
      options: [
        "To compress data tables on disk",
        "To dramatically speed up data retrieval (SELECT queries) at the cost of additional storage and write overhead",
        "To encrypt sensitive columns in transit",
        "To prevent duplicate foreign key insertions",
      ],
      correctOptionIndex: 1,
      explanation: "Database indexes (such as B-Trees) enable the query engine to find rows matching WHERE conditions quickly without performing full table scans, trading off write performance and disk space.",
      category: "Databases & SQL",
      difficulty: "intermediate",
    },
    {
      id: "fs3_q2",
      question: "In RESTful API design, what is the semantic difference between PUT and PATCH methods?",
      options: [
        "PUT updates partial fields, while PATCH replaces the entire resource representation",
        "PUT replaces the entire resource (or creates it if absent), while PATCH applies partial modifications to an existing resource",
        "PUT is asynchronous, while PATCH is synchronous",
        "PUT cannot include a request body, while PATCH can",
      ],
      correctOptionIndex: 1,
      explanation: "HTTP PUT is idempotent and represents a full replacement of the resource, whereas HTTP PATCH applies a partial update containing only changed fields.",
      category: "API Design",
      difficulty: "intermediate",
    },
    {
      id: "fs3_q3",
      question: "In Node.js, what is the role of the Event Loop?",
      options: [
        "It spawns a new operating system thread for every incoming HTTP request",
        "It orchestrates non-blocking I/O operations on a single thread by offloading operations to libuv and executing callbacks in phases",
        "It compiles TypeScript into V8 bytecode during execution",
        "It manages database replication across clusters",
      ],
      correctOptionIndex: 1,
      explanation: "The Node.js event loop enables asynchronous non-blocking I/O by executing code, collecting events, and processing queued sub-tasks in structured phases (timers, I/O, check/setImmediate).",
      category: "Node.js Internals",
      difficulty: "advanced",
    },
    {
      id: "fs3_q4",
      question: "What are the four core properties of ACID transactions in relational databases?",
      options: [
        "Asynchronous, Consistent, Integrated, Distributed",
        "Atomicity, Consistency, Isolation, Durability",
        "Authentication, Cryptography, Integrity, Decryption",
        "Aggregation, Caching, Indexing, Deduplication",
      ],
      correctOptionIndex: 1,
      explanation: "ACID stands for Atomicity (all-or-nothing), Consistency (rules maintained), Isolation (independent concurrent execution), and Durability (committed data survives crashes).",
      category: "Databases",
      difficulty: "intermediate",
    },
    {
      id: "fs3_q5",
      question: "Which HTTP status code is most appropriate when a client request fails due to lack of valid authentication credentials?",
      options: ["400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found"],
      correctOptionIndex: 1,
      explanation: "401 Unauthorized indicates that the request lacks valid authentication credentials. In contrast, 403 Forbidden means the identity is known but lacks required authorization permissions.",
      category: "HTTP Standards",
      difficulty: "beginner",
    },
    {
      id: "fs3_q6",
      question: "What is JSON Web Token (JWT) signature verification used for?",
      options: [
        "Encrypting the payload so it cannot be read in browser dev tools",
        "Cryptographically verifying that the token payload was issued by a trusted server and has not been tampered with",
        "Compressing the payload to under 100 bytes",
        "Preventing Cross-Site Scripting (XSS) automatically",
      ],
      correctOptionIndex: 1,
      explanation: "The signature part of a JWT is calculated using a secret/private key over the header and payload, allowing servers to verify authenticity and integrity without storing session state.",
      category: "Security & Auth",
      difficulty: "intermediate",
    },
    {
      id: "fs3_q7",
      question: "What is an N+1 Query Problem in database ORM usage (such as Prisma or TypeORM)?",
      options: [
        "Executing N+1 simultaneous database migrations",
        "Fetching 1 parent record and subsequently executing N individual database queries for each child relation instead of a single JOIN",
        "Exceeding the maximum connection pool limit by 1",
        "Creating N+1 indexes on a single table",
      ],
      correctOptionIndex: 1,
      explanation: "The N+1 query problem occurs when an application queries 1 record for parent items and then executes N subsequent queries for related items in a loop, severely degrading performance.",
      category: "Database Performance",
      difficulty: "advanced",
    },
    {
      id: "fs3_q8",
      question: "Which mechanism in PostgreSQL ensures data consistency and transaction isolation without table-level write locks?",
      options: [
        "Multi-Version Concurrency Control (MVCC)",
        "Single-Threaded Dispatch",
        "Thread Local Storage",
        "Two-Phase Locking (2PL) on all reads",
      ],
      correctOptionIndex: 0,
      explanation: "PostgreSQL uses MVCC (Multi-Version Concurrency Control) so readers do not block writers and writers do not block readers, maintaining snapshots of rows for each transaction.",
      category: "PostgreSQL Internals",
      difficulty: "advanced",
    },
    {
      id: "fs3_q9",
      question: "What is the primary role of Redis in a high-throughput modern web architecture?",
      options: [
        "Long-term cold archival of video files",
        "Ultra-fast in-memory caching, rate-limiting, and pub/sub message brokering",
        "Relational schema validation and indexing",
        "Executing heavy client-side React hydration",
      ],
      correctOptionIndex: 1,
      explanation: "Redis is an in-memory key-value data structure store used as a fast cache, message broker, distributed lock manager, and rate-limiting store.",
      category: "Distributed Caching",
      difficulty: "intermediate",
    },
    {
      id: "fs3_q10",
      question: "What is the main defense against Cross-Site Request Forgery (CSRF) attacks in modern web apps?",
      options: [
        "Using HTTPS encryption exclusively",
        "Using SameSite cookie attributes (SameSite=Lax/Strict) and anti-CSRF verification tokens for state-mutating requests",
        "Hiding database passwords in environment variables",
        "Using React keys on all list elements",
      ],
      correctOptionIndex: 1,
      explanation: "SameSite cookie attributes prevent browsers from sending cookies with cross-site requests, and CSRF tokens verify that mutation requests originate from authenticated user sessions.",
      category: "Web Security",
      difficulty: "advanced",
    },
  ],

  // =========================================================================
  // 4. FULL-STACK: PHASE 4 (Practice & Projects — Performance & Full-Stack Apps)
  // =========================================================================
  "fullstack_4": [
    {
      id: "fs4_q1",
      question: "What is the primary purpose of Next.js Server Actions?",
      options: [
        "To replace CSS animation keyframes",
        "To define server-side async functions that can be invoked directly from client components without manually setting up API route handlers",
        "To run background cron jobs on the user's mobile device",
        "To convert client-side state into static JSON files",
      ],
      correctOptionIndex: 1,
      explanation: "Server Actions allow developers to mutate server state, revalidate cache tags, and handle form submissions seamlessly from React components.",
      category: "Next.js Full-Stack",
      difficulty: "intermediate",
    },
    {
      id: "fs4_q2",
      question: "What technique should be used to prevent excessive re-renders when passing callback functions to memoized child components in React?",
      options: ["useCallback", "useRef", "useTransition", "useDeferredValue"],
      correctOptionIndex: 0,
      explanation: "useCallback memoizes callback function references between renders, preventing child components wrapped in React.memo from re-rendering unnecessarily.",
      category: "React Performance",
      difficulty: "intermediate",
    },
    {
      id: "fs4_q3",
      question: "In full-stack applications, what is Optimistic UI updating?",
      options: [
        "Waiting for server response before updating UI elements",
        "Immediately updating the user interface under the assumption the server request will succeed, and rolling back if it fails",
        "Preventing users from clicking submit buttons multiple times",
        "Caches API responses indefinitely",
      ],
      correctOptionIndex: 1,
      explanation: "Optimistic UI immediately reflects the expected state mutation in the interface to deliver instant user feedback, reverting to previous state if the network request fails.",
      category: "UI Architecture",
      difficulty: "intermediate",
    },
    {
      id: "fs4_q4",
      question: "Which HTTP header is essential for preventing Clickjacking attacks?",
      options: ["Content-Security-Policy with frame-ancestors (or X-Frame-Options)", "Access-Control-Allow-Origin", "Cache-Control", "Accept-Encoding"],
      correctOptionIndex: 0,
      explanation: "X-Frame-Options (or CSP frame-ancestors) instructs browsers whether a page can be rendered inside an <iframe>, preventing malicious overlays and clickjacking.",
      category: "Web Security",
      difficulty: "advanced",
    },
    {
      id: "fs4_q5",
      question: "What does Next.js 'revalidatePath' or 'revalidateTag' do?",
      options: [
        "Clears the browser's cookies",
        "Purges cached data on the server for specified routes/tags and re-renders on the next request",
        "Forces a full browser page reload on the client",
        "Reboots the Node.js process",
      ],
      correctOptionIndex: 1,
      explanation: "revalidatePath / revalidateTag allows on-demand cache invalidation of Incremental Static Regeneration (ISR) and server cache layers in Next.js.",
      category: "Next.js Caching",
      difficulty: "intermediate",
    },
    {
      id: "fs4_q6",
      question: "What is the purpose of database Connection Pooling in serverless environments (e.g. Next.js on Vercel or AWS Lambda)?",
      options: [
        "To allow clients to execute raw SQL directly in browser console",
        "To manage and reuse database connections across ephemeral serverless invocations, avoiding connection exhaustion",
        "To encrypt database tables",
        "To convert relational tables to NoSQL collections",
      ],
      correctOptionIndex: 1,
      explanation: "Serverless functions spin up and tear down rapidly; without a connection pooler (like PgBouncer or Prisma Accelerate), rapid concurrent invocations exhaust PostgreSQL connection limits.",
      category: "Serverless & DB Architecture",
      difficulty: "advanced",
    },
    {
      id: "fs4_q7",
      question: "How does React 18 'useTransition' improve user experience during heavy state updates?",
      options: [
        "It forces animations to run at 120 FPS",
        "It marks state updates as non-urgent transitions, keeping high-priority inputs responsive and interactive",
        "It blocks user input until background operations finish",
        "It runs computations in WebAssembly",
      ],
      correctOptionIndex: 1,
      explanation: "useTransition allows developers to mark state updates as non-blocking transitions, ensuring user interactions (like typing in an input) remain instantaneous and fluid.",
      category: "React 18 Concurrent",
      difficulty: "advanced",
    },
    {
      id: "fs4_q8",
      question: "What is the primary benefit of structured error logging with tools like Sentry in production web apps?",
      options: [
        "Automatically writing unit tests",
        "Capturing real-time runtime exceptions with stack traces, context, and user breadcrumbs for rapid debugging",
        "Encrypting database connections",
        "Speeding up CSS compilation",
      ],
      correctOptionIndex: 1,
      explanation: "Error monitoring platforms capture uncaught production runtime errors, context, and stack traces, enabling engineering teams to diagnose and patch regressions proactively.",
      category: "Observability",
      difficulty: "intermediate",
    },
    {
      id: "fs4_q9",
      question: "What is the difference between client-side debounce and throttle functions?",
      options: [
        "Debounce delays execution until a pause in events; throttle limits execution to once per specified time interval",
        "Debounce runs on the server; throttle runs on the client",
        "Throttle cancels requests; debounce retries requests",
        "They are identical synonyms in JavaScript",
      ],
      correctOptionIndex: 0,
      explanation: "Debouncing waits for a specified quiet period before executing, whereas throttling guarantees execution at regular periodic intervals during continuous events.",
      category: "JavaScript Algorithms",
      difficulty: "intermediate",
    },
    {
      id: "fs4_q10",
      question: "Which Core Web Vital metric measures visual stability and unexpected layout shifts during page load?",
      options: ["LCP (Largest Contentful Paint)", "INP (Interaction to Next Paint)", "CLS (Cumulative Layout Shift)", "TTFB (Time to First Byte)"],
      correctOptionIndex: 2,
      explanation: "CLS (Cumulative Layout Shift) measures the visual stability of a webpage by tracking unexpected shifts of visible elements as resources load.",
      category: "Web Performance & Core Vitals",
      difficulty: "intermediate",
    },
  ],

  // =========================================================================
  // 5. FULL-STACK: PHASE 5 (Capstone & Production Deployment)
  // =========================================================================
  "fullstack_5": [
    {
      id: "fs5_q1",
      question: "In Docker, what is the purpose of a Multi-Stage Build?",
      options: [
        "To run multiple containers inside a single image",
        "To separate build-time dependencies (compilers, devDependencies) from runtime images, producing minimal, secure production containers",
        "To deploy containers to multiple cloud providers simultaneously",
        "To execute unit tests in parallel across clusters",
      ],
      correctOptionIndex: 1,
      explanation: "Multi-stage Docker builds allow you to use intermediate images with build tools and copy only the compiled artifacts into a lightweight, clean runtime base image.",
      category: "DevOps & Containers",
      difficulty: "advanced",
    },
    {
      id: "fs5_q2",
      question: "What is the primary function of a Content Delivery Network (CDN) edge network for static and ISR web applications?",
      options: [
        "Running relational database transactions",
        "Caching and serving static assets and pre-rendered pages geographically close to users for sub-50ms latency",
        "Encrypting database passwords",
        "Compiling TypeScript code on client devices",
      ],
      correctOptionIndex: 1,
      explanation: "CDNs cache static files, images, and pre-rendered HTML on globally distributed edge servers, drastically reducing server load and round-trip latency.",
      category: "Cloud Infrastructure",
      difficulty: "intermediate",
    },
    {
      id: "fs5_q3",
      question: "What is Blue-Green Deployment strategy?",
      options: [
        "Testing code only during daylight hours",
        "Maintaining two identical production environments (Blue and Green), routing user traffic to one while deploying and validating the next version on the other with zero downtime",
        "Deploying code directly to production servers without testing",
        "Running frontend on Blue servers and database on Green servers",
      ],
      correctOptionIndex: 1,
      explanation: "Blue-Green deployment provisions two identical environments; new versions are deployed and verified on the idle environment before switching router traffic instantly with zero downtime and fast rollback.",
      category: "CI/CD & DevOps",
      difficulty: "advanced",
    },
    {
      id: "fs5_q4",
      question: "What does the 'Strict-Transport-Security' (HSTS) HTTP response header enforce?",
      options: [
        "Forces browsers to always communicate with the server over HTTPS, preventing protocol downgrade attacks",
        "Disables all client-side JavaScript execution",
        "Requires two-factor authentication on every request",
        "Blocks requests from mobile devices",
      ],
      correctOptionIndex: 0,
      explanation: "HSTS tells browsers to convert all HTTP requests to HTTPS automatically and block connection if valid SSL certificates cannot be verified.",
      category: "Security & TLS",
      difficulty: "advanced",
    },
    {
      id: "fs5_q5",
      question: "What is an architectural Reverse Proxy (like NGINX or Cloudflare)?",
      options: [
        "A proxy server that sits between client devices and origin backend servers to handle SSL termination, load balancing, compression, and caching",
        "A database driver that translates SQL to NoSQL",
        "A client-side state management hook in React",
        "A tool for reversing compiled binary executables",
      ],
      correctOptionIndex: 0,
      explanation: "A reverse proxy fronts backend web servers, intercepting incoming traffic to manage load balancing, SSL termination, DDoS protection, and caching.",
      category: "System Architecture",
      difficulty: "advanced",
    },
    {
      id: "fs5_q6",
      question: "Which of the following is a best practice for managing sensitive secrets (API keys, database URLs) in production CI/CD pipelines?",
      options: [
        "Committing secrets directly into public Git repository README files",
        "Injecting encrypted environment variables via secrets managers (e.g. AWS Secrets Manager, GitHub Secrets) at build/runtime",
        "Hardcoding secrets in client-side React code",
        "Storing secrets in plain text configuration files",
      ],
      correctOptionIndex: 1,
      explanation: "Production secrets should never be checked into version control. They should be stored in dedicated secret management vaults and injected as environment variables.",
      category: "DevSecOps",
      difficulty: "intermediate",
    },
    {
      id: "fs5_q7",
      question: "What is the purpose of database read replicas in high-scale architectures?",
      options: [
        "To handle high write throughput and database migrations",
        "To offload read-heavy SELECT queries from the primary master database, enhancing scalability and redundancy",
        "To replace the need for backups",
        "To eliminate the need for database indexing",
      ],
      correctOptionIndex: 1,
      explanation: "Read replicas replicate data from the primary master asynchronously, allowing read-heavy traffic to distribute across multiple nodes while the primary handles writes.",
      category: "Database Scaling",
      difficulty: "advanced",
    },
    {
      id: "fs5_q8",
      question: "How do Canary Releases mitigate risk during major application deployments?",
      options: [
        "By deploying the update to a small percentage of real user traffic first, monitoring error rates before rolling out to 100%",
        "By disabling database migrations entirely",
        "By restarting all servers simultaneously",
        "By encrypting all API endpoints",
      ],
      correctOptionIndex: 0,
      explanation: "Canary releases roll out new software versions to a small subset of production traffic (e.g. 5%), monitoring metrics and telemetry before rolling out globally.",
      category: "CI/CD Deployment",
      difficulty: "advanced",
    },
    {
      id: "fs5_q9",
      question: "What is Rate Limiting and what algorithm is commonly used to implement it?",
      options: [
        "Limiting the number of database tables; implemented with Bubble Sort",
        "Restricting the number of API requests a client can make within a time window; commonly implemented with Token Bucket or Leaky Bucket algorithms",
        "Limiting the screen brightness of client devices",
        "Restricting CSS bundle sizes",
      ],
      correctOptionIndex: 1,
      explanation: "Rate limiting prevents API abuse and DoS attacks by capping request volume per IP/user. Token Bucket and Leaky Bucket are standard memory-efficient algorithms.",
      category: "System Design",
      difficulty: "advanced",
    },
    {
      id: "fs5_q10",
      question: "What is the primary objective of a Post-Mortem / Incident Review after a production outage?",
      options: [
        "Assigning personal blame to the engineer who merged the PR",
        "Analyzing root causes, documenting timelines, and establishing blameless action items to prevent recurrence",
        "Deleting all server logs to save disk space",
        "Reverting to software architectures from 10 years ago",
      ],
      correctOptionIndex: 1,
      explanation: "A blameless post-mortem focuses on identifying structural systemic failure points, improving automated safeguards, and creating preventative action items.",
      category: "Engineering Culture & Reliability",
      difficulty: "intermediate",
    },
  ],
};

/**
 * Fallback dynamic question generator for specialized domains (DSA, AI/ML, Cloud, etc.)
 * when phase-specific custom curricula are loaded.
 */
export function generateDynamicPhaseQuestions(
  phaseNumber: number,
  phaseTitle: string,
  lessonTitles: string[]
): AssessmentQuestionWithAnswer[] {
  // Check if we have an explicit predefined question bank for this phase
  const key = `fullstack_${phaseNumber}`;
  if (PHASE_QUESTION_BANKS[key]) {
    return PHASE_QUESTION_BANKS[key];
  }

  // Generate 10 tailored conceptual MCQs using phase lessons
  const pool: AssessmentQuestionWithAnswer[] = [];
  const lessons = lessonTitles.length > 0 ? lessonTitles : ["Core Concepts", "Architecture", "Best Practices"];

  for (let i = 0; i < 10; i++) {
    const lesson = lessons[i % lessons.length];
    pool.push({
      id: `dyn_p${phaseNumber}_q${i + 1}`,
      question: `In the context of ${phaseTitle}, which principle is fundamental when working with ${lesson}?`,
      options: [
        `Ensuring proper encapsulation, modularity, and error boundary handling in ${lesson}`,
        `Ignoring edge cases and relying strictly on client-side default behavior`,
        `Hardcoding configuration values directly into production logic`,
        `Executing blocking synchronous loops across the main thread`,
      ],
      correctOptionIndex: 0,
      explanation: `Proper encapsulation, modularity, and comprehensive error handling are essential best practices when engineering robust architectures with ${lesson}.`,
      category: phaseTitle,
      difficulty: i < 3 ? "beginner" : i < 7 ? "intermediate" : "advanced",
    });
  }

  return pool;
}
