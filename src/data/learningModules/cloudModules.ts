import { DetailedLessonModule } from "./types";

export const cloudModules: Record<string, DetailedLessonModule> = {
  // Phase 1.1: Linux File Systems, Systemd & Daemons
  "linux_systemd_daemons": {
    topicId: "cloud_1_1",
    title: "Linux File Systems, Systemd & Daemons",
    subtitle: "POSIX permissions, process lifecycles, cgroups v2, and systemd unit services.",
    domain: "Cloud Architecture & DevOps",
    phaseName: "Foundation",
    duration: "35m",
    type: "concept",
    keyObjectives: [
      "Understand Linux directory hierarchies (/etc, /var, /proc, /sys) and inode file metadata.",
      "Manage service lifecycles with systemctl and inspect journalctl logs.",
      "Configure production systemd unit files with auto-restart, sandboxing, and resource limits.",
      "Inspect memory, CPU, and process states with top, htop, lsof, and strace.",
    ],
    deepDive: {
      overview:
        "Linux powers over 90% of global cloud infrastructure. Understanding the Linux kernel, systemd initialization daemon, process scheduling, and POSIX permissions is foundational to deploying reliable backend containers and bare-metal nodes.",
      mentalModel:
        "Think of the Linux kernel as the conductor of an orchestra. Systemd is the stage manager that assigns musicians their seats, checks their health, and replaces them if they faint.",
      coreConcepts: [
        {
          title: "Systemd Unit Directives",
          description:
            "A systemd service unit defines how a daemon starts, environment variables, restart policies (Restart=always), and security sandboxing (NoNewPrivileges=yes, ProtectSystem=strict).",
          highlight: "Never run daemons as root; create dedicated unprivileged service users.",
        },
      ],
      pitfalls: [
        "Neglecting RestartSec and Restart=always in production service files, causing daemons to stay dead after unhandled crashes.",
      ],
      realWorldApplications:
        "Production server provisioning, bastion host hardening, and edge gateway management.",
    },
    codeBlueprint: {
      language: "ini",
      languageBadge: "Systemd Unit • Linux",
      filename: "/etc/systemd/system/shiksha-api.service",
      code: `[Unit]
Description=Shiksha API Production Daemon
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=shiksha
Group=shiksha
WorkingDirectory=/opt/shiksha/backend
ExecStart=/opt/shiksha/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=5s

# Security Sandboxing & Hardening
NoNewPrivileges=yes
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/opt/shiksha/logs

# Resource Constraints (cgroups)
LimitNOFILE=65535
MemoryMax=2G
CPUQuota=200%

[Install]
WantedBy=multi-user.target`,
      explanation: "Production-grade systemd service unit file with sandboxing, non-root user, cgroup limits, and automatic restart on crash.",
    },
    quizQuestions: [
      {
        question: "Why should systemd units specify 'NoNewPrivileges=yes'?",
        options: [
          "It prevents child processes from gaining elevated root privileges via setuid binaries, securing the container host.",
          "It forces the service to run single-threaded.",
          "It enables memory compression.",
          "It prevents the service from opening network sockets.",
        ],
        correctIndex: 0,
        explanation:
          "NoNewPrivileges ensures that the process and its descendants cannot gain additional privileges even if executing a setuid binary.",
      },
    ],
    resources: [
      {
        title: "Freedesktop Systemd Official Manual: systemd.service",
        url: "https://www.freedesktop.org/software/systemd/man/systemd.service.html",
        type: "documentation",
        description: "Official specification of systemd service parameters and sandboxing.",
      },
    ],
  },

  // Phase 2.1: Multi-Stage Dockerfiles & Layer Caching
  "docker_multistage_caching": {
    topicId: "cloud_2_1",
    title: "Multi-Stage Dockerfiles & Layer Caching",
    subtitle: "Minimize container size, leverage BuildKit cache mounts, and run as unprivileged users.",
    domain: "Cloud Architecture & DevOps",
    phaseName: "Core Skills",
    duration: "40m",
    type: "concept",
    keyObjectives: [
      "Order Dockerfile instructions to maximize BuildKit layer cache hit ratios.",
      "Separate build-time dependencies (compilers, devDependencies) from runtime images using multi-stage builds.",
      "Reduce image size from 1.5GB to <100MB with minimal distroless or alpine base images.",
      "Enforce non-root execution (USER node) to prevent container escape exploits.",
    ],
    deepDive: {
      overview:
        "Every Dockerfile instruction creates a cached read-only layer. Placing frequently changing code before static package manifests invalidates all subsequent layers on every commit. Multi-stage builds compile code in a heavy builder container, copying only the final minified binary into a pristine minimal production image.",
      mentalModel:
        "Think of a multi-stage Docker build like a commercial bakery. In the kitchen, you have heavy flour mixers, ovens, and messy utensils (compiler, npm, build tools). Once the pastry is baked, you pack only the finished pastry into a clean decorative box to deliver to the customer.",
      coreConcepts: [
        {
          title: "BuildKit Cache Mounts",
          description:
            "Using RUN --mount=type=cache,target=/root/.npm allows package manager caches to persist across builds without bloating the committed layer size.",
          highlight: "Copy package.json and lockfiles first before copying application source code.",
        },
      ],
      pitfalls: [
        "Running containers as the default root user, leaving the host operating system vulnerable to container escape CVEs.",
      ],
      realWorldApplications:
        "Kubernetes production workloads, AWS ECS Fargate tasks, and rapid CI/CD build runners.",
    },
    codeBlueprint: {
      language: "dockerfile",
      languageBadge: "Dockerfile • BuildKit",
      filename: "Dockerfile",
      code: `# syntax=docker/dockerfile:1.4
# Stage 1: Build & Compile
FROM node:20-alpine AS builder
WORKDIR /app

# Cache dependency layer
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy source and compile
COPY . .
RUN npm run build
RUN npm prune --production

# Stage 2: Minimal Distroless Production Runner
FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only production artifacts and node_modules from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Automatically runs as nonroot user ID 65532
EXPOSE 3000
CMD ["server.js"]`,
      explanation: "Multi-stage Dockerfile compiling Next.js standalone output and deploying to Google Distroless non-root image under 85MB.",
    },
    quizQuestions: [
      {
        question: "Why should 'COPY package.json package-lock.json ./' come before 'COPY . .' in a Dockerfile?",
        options: [
          "To allow Docker to reuse the cached npm install layer when application source code changes without dependency updates.",
          "Because package.json must be compiled first.",
          "Docker syntax requires package files to be first.",
          "To reduce network bandwidth.",
        ],
        correctIndex: 0,
        explanation:
          "Docker caches layers. If you copy all code first, any single line edit invalidates the cache, forcing npm install to rerun on every build.",
      },
    ],
    resources: [
      {
        title: "Docker Official Docs: Multi-stage Builds",
        url: "https://docs.docker.com/build/building/multi-stage/",
        type: "documentation",
        description: "Official guide to multi-stage architectures and BuildKit features.",
      },
    ],
  },
};
