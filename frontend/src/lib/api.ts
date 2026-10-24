import {
  CourseDetail,
  CourseListResponse,
  CourseSummary,
  EnquiryFormData,
  EnquirySubmitResponse,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Verified sample course fallback data ensures SSR and static builds succeed reliably
export const FALLBACK_COURSES: CourseDetail[] = [
  {
    id: 1,
    slug: 'fullstack-web-engineering',
    title: 'Modern Full-Stack Web Engineering',
    tagline: 'Master TypeScript, React, Next.js, Node.js, and PostgreSQL through production-grade projects.',
    description: 'An end-to-end, project-centric engineering program designed for college seniors, freshers, and early-career developers. Learners progress from core computer science and web fundamentals to building, testing, and deploying scalable web services.',
    category: 'Software Engineering',
    level: 'Intermediate',
    audience: 'freshers',
    duration_weeks: 16,
    hours_per_week: 12,
    format: 'Interactive Live Sessions + Daily Code Labs',
    is_sample: true,
    key_skills: [
      'TypeScript',
      'Next.js App Router',
      'Node.js & Express',
      'PostgreSQL & Prisma',
      'REST & GraphQL APIs',
      'Docker & CI/CD',
      'Unit & Integration Testing',
    ],
    prerequisites: [
      'Basic programming proficiency in any language (JavaScript, Python, C++, or Java)',
      'Understanding of basic data structures (arrays, hash maps, linked lists)',
      'Familiarity with command-line basics and Git',
    ],
    modules: [
      {
        module_number: 1,
        title: 'Advanced TypeScript & Web Standards',
        description: 'Deep dive into strong typing, asynchronous programming, DOM lifecycle, and modern ESNext capabilities.',
        lessons: [
          { title: 'TypeScript Type System & Generics', type: 'lecture', duration_min: 60 },
          { title: 'Asynchronous Patterns & Event Loop', type: 'lab', duration_min: 90 },
          { title: 'Modern Web Security: XSS, CSRF, and CORS', type: 'lecture', duration_min: 60 },
        ],
      },
      {
        module_number: 2,
        title: 'Component Architecture with Next.js & React 18+',
        description: 'Server Components, Client Components, streaming SSR, state management, and accessible UI patterns.',
        lessons: [
          { title: 'Next.js App Router & Server Components', type: 'lecture', duration_min: 60 },
          { title: 'Client-Side State with Zustand & React Query', type: 'lab', duration_min: 90 },
          { title: 'Accessible Design Systems with Tailwind CSS', type: 'lab', duration_min: 75 },
        ],
      },
      {
        module_number: 3,
        title: 'Scalable Backend Architecture & Relational Databases',
        description: 'Designing normalized relational schemas in PostgreSQL, building RESTful services, transactional integrity, and indexing.',
        lessons: [
          { title: 'Relational Data Modeling & PostgreSQL Indexing', type: 'lecture', duration_min: 60 },
          { title: 'Building Resilient RESTful APIs with Node.js', type: 'lab', duration_min: 90 },
          { title: 'Authentication: JWT, Secure Cookies & OAuth2', type: 'lab', duration_min: 90 },
        ],
      },
      {
        module_number: 4,
        title: 'Testing, Containerization & Production Deployment',
        description: 'Automated testing with Jest and Playwright, containerization with Docker, and setting up GitHub Actions pipelines.',
        lessons: [
          { title: 'Test-Driven Development & Integration Testing', type: 'lecture', duration_min: 60 },
          { title: 'Dockerizing Multi-Container Full-Stack Apps', type: 'lab', duration_min: 90 },
          { title: 'CI/CD Pipeline Construction with GitHub Actions', type: 'lab', duration_min: 90 },
        ],
      },
    ],
    projects: [
      {
        title: 'B2B SaaS Collaborative Workspace',
        description: 'Full-stack application featuring role-based access control, real-time collaboration via WebSockets, and transactional billing integration.',
        tech_stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Node.js', 'Docker'],
      },
      {
        title: 'High-Throughput Analytics Dashboard',
        description: 'Data ingestion pipeline and interactive dashboard with database query optimization, indexing strategies, and automated end-to-end test suites.',
        tech_stack: ['React', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Jest'],
      },
    ],
  },
  {
    id: 2,
    slug: 'cloud-architecture-devops',
    title: 'Cloud Architecture & DevOps Engineering',
    tagline: 'Design resilient infrastructure, master Kubernetes orchestration, and automate delivery pipelines.',
    description: 'A comprehensive practical track built for working engineers and systems enthusiasts. Focuses on production reliability, Infrastructure as Code, Kubernetes cluster management, observability, and cost-effective cloud setups.',
    category: 'Cloud & Infrastructure',
    level: 'Advanced',
    audience: 'working-professionals',
    duration_weeks: 14,
    hours_per_week: 10,
    format: 'Hands-On Weekend Labs + Architecture Reviews',
    is_sample: true,
    key_skills: [
      'Linux Systems Internals',
      'Docker & Container Security',
      'Kubernetes (K8s)',
      'Terraform (IaC)',
      'CI/CD with GitHub Actions',
      'Prometheus & Grafana Observability',
      'Cloud Security & Networking',
    ],
    prerequisites: [
      'At least 1 year of software engineering or system administration experience',
      'Working knowledge of Linux shell and basic networking concepts (TCP/IP, DNS, HTTP)',
      'Familiarity with at least one scripting language (Python, Bash, or Go)',
    ],
    modules: [
      {
        module_number: 1,
        title: 'Infrastructure as Code & Cloud Fundamentals',
        description: 'Automating cloud infrastructure provisioning using Terraform and managing state safely.',
        lessons: [
          { title: 'Cloud Virtual Networks, Subnets, and Security Groups', type: 'lecture', duration_min: 60 },
          { title: 'Modular Terraform Architecture & State Management', type: 'lab', duration_min: 90 },
        ],
      },
      {
        module_number: 2,
        title: 'Container Orchestration with Kubernetes',
        description: 'Pods, Deployments, Services, Ingress controllers, Helm charts, and persistent volumes.',
        lessons: [
          { title: 'K8s Architecture: Control Plane & Worker Nodes', type: 'lecture', duration_min: 60 },
          { title: 'Configuring Deployments, Ingress & TLS Certificates', type: 'lab', duration_min: 90 },
          { title: 'Packaging Microservices with Helm', type: 'lab', duration_min: 90 },
        ],
      },
      {
        module_number: 3,
        title: 'Site Reliability & Production Observability',
        description: 'Implementing metrics collection, distributed tracing, structured logging, and alerting rules.',
        lessons: [
          { title: 'Metrics Collection with Prometheus & Grafana', type: 'lab', duration_min: 90 },
          { title: 'Log Aggregation & Distributed Tracing Patterns', type: 'lecture', duration_min: 60 },
        ],
      },
    ],
    projects: [
      {
        title: 'Multi-Region Zero-Downtime Infrastructure',
        description: 'Terraform-automated VPC, managed Kubernetes cluster, blue-green deployment pipeline, and SSL-automated Ingress.',
        tech_stack: ['Terraform', 'Kubernetes', 'Helm', 'GitHub Actions'],
      },
      {
        title: 'Full-Stack Observability & Incident Alerting Suite',
        description: 'Production monitoring stack with customized Grafana dashboards, Slack/Pager alerting rules, and synthetic health monitors.',
        tech_stack: ['Prometheus', 'Grafana', 'Alertmanager', 'Docker'],
      },
    ],
  },
  {
    id: 3,
    slug: 'data-science-ai-engineering',
    title: 'Applied Data Science & Machine Learning Systems',
    tagline: 'Build end-to-end data pipelines, evaluate ML models, and serve AI applications via production APIs.',
    description: 'Targeted at college students, STEM graduates, and engineers transitioning into AI. Grounded in mathematical foundations, statistical rigor, data engineering pipelines, feature stores, and robust model serving.',
    category: 'Data & Artificial Intelligence',
    level: 'Intermediate',
    audience: 'students',
    duration_weeks: 16,
    hours_per_week: 12,
    format: 'Interactive Code Walkthroughs + Research Paper Labs',
    is_sample: true,
    key_skills: [
      'Python for Scientific Computing',
      'Pandas & NumPy',
      'SQL & Data Warehousing',
      'Scikit-Learn & PyTorch',
      'FastAPI Model Serving',
      'Feature Engineering & Evaluation',
      'LLM Orchestration & Embeddings',
    ],
    prerequisites: [
      'Undergraduate mathematics (linear algebra, probability, and basic calculus)',
      'Intermediate Python programming proficiency',
      'Basic understanding of SQL queries',
    ],
    modules: [
      {
        module_number: 1,
        title: 'Exploratory Data Analysis & Statistical Modeling',
        description: 'Cleaning messy data, distribution testing, hypothesis testing, and exploratory visual analytics.',
        lessons: [
          { title: 'Data Wrangling at Scale with Pandas', type: 'lab', duration_min: 90 },
          { title: 'Hypothesis Testing and Statistical Inference', type: 'lecture', duration_min: 60 },
        ],
      },
      {
        module_number: 2,
        title: 'Supervised & Unsupervised Machine Learning',
        description: 'Regression, classification, tree-based ensembles, clustering, and cross-validation methodologies.',
        lessons: [
          { title: 'Feature Engineering & Dimensionality Reduction', type: 'lecture', duration_min: 60 },
          { title: 'Ensemble Models: XGBoost, LightGBM & Random Forests', type: 'lab', duration_min: 90 },
        ],
      },
      {
        module_number: 3,
        title: 'Production Model Serving & LLM Integrations',
        description: 'Packaging models as microservices, batch inference, vector embeddings, and retrieval-augmented generation pipelines.',
        lessons: [
          { title: 'Serving Low-Latency Predictions with FastAPI', type: 'lab', duration_min: 90 },
          { title: 'Vector Databases & Grounded Semantic Search', type: 'lab', duration_min: 90 },
        ],
      },
    ],
    projects: [
      {
        title: 'Customer Churn Risk Prediction Engine',
        description: 'End-to-end predictive machine learning model with feature drift monitoring, calibrated probabilities, and interactive executive reporting.',
        tech_stack: ['Python', 'Scikit-Learn', 'FastAPI', 'PostgreSQL', 'Docker'],
      },
      {
        title: 'Domain-Specific Technical Knowledge RAG Assistant',
        description: 'Contextual question-answering system using document chunking, embedding generation, semantic retrieval, and guardrail validation.',
        tech_stack: ['Python', 'FastAPI', 'ChromaDB/FAISS', 'Pydantic'],
      },
    ],
  },
  {
    id: 4,
    slug: 'enterprise-java-microservices',
    title: 'Enterprise Java & Spring Boot Microservices',
    tagline: 'Architect enterprise-grade backend systems with Spring Boot, Apache Kafka, and distributed patterns.',
    description: 'Specially designed for campus hiring readiness and professional developers targeting top tier backend roles. Covers clean architecture, DDD, event-driven messaging, distributed transactions, and database optimization.',
    category: 'Enterprise Backend',
    level: 'Intermediate',
    audience: 'colleges',
    duration_weeks: 14,
    hours_per_week: 10,
    format: 'Campus-Aligned Workshops + Live Code Reviews',
    is_sample: true,
    key_skills: [
      'Java 21 Core & Concurrency',
      'Spring Boot 3.x',
      'Spring Data JPA & Hibernate',
      'Apache Kafka Event Streaming',
      'Microservices Resilience Patterns',
      'OAuth2 / Spring Security',
      'JUnit 5 & Mockito',
    ],
    prerequisites: [
      'Object-Oriented Programming principles in Java or C++',
      'Basic understanding of relational databases and SQL',
      'Familiarity with Git version control',
    ],
    modules: [
      {
        module_number: 1,
        title: 'Modern Java 21 & Concurrency',
        description: 'Virtual threads, records, pattern matching, collections framework, and clean code practices.',
        lessons: [
          { title: 'Virtual Threads & Java 21 Concurrency', type: 'lecture', duration_min: 60 },
          { title: 'Effective Java: Design Patterns & Immutability', type: 'lab', duration_min: 90 },
        ],
      },
      {
        module_number: 2,
        title: 'Building Resilient Microservices with Spring Boot',
        description: 'REST APIs, validation, exception handling, Spring Data JPA optimization, and connection pooling.',
        lessons: [
          { title: 'Spring Boot 3 Architecture & Dependency Injection', type: 'lecture', duration_min: 60 },
          { title: 'JPA N+1 Problem Prevention & Query Tuning', type: 'lab', duration_min: 90 },
        ],
      },
      {
        module_number: 3,
        title: 'Event-Driven Systems with Apache Kafka',
        description: 'Producers, consumers, topic partitioning, exactly-once semantics, and saga orchestrations.',
        lessons: [
          { title: 'Kafka Producer/Consumer Architecture', type: 'lab', duration_min: 90 },
          { title: 'Distributed Transactions with the Saga Pattern', type: 'lecture', duration_min: 60 },
        ],
      },
    ],
    projects: [
      {
        title: 'Distributed Banking Transaction Engine',
        description: 'High-concurrency account ledger microservice with idempotent transaction processing, audit trails, and Kafka event streaming.',
        tech_stack: ['Java 21', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Docker'],
      },
    ],
  },
  {
    id: 5,
    slug: 'embedded-systems-iot-engineering',
    title: 'Embedded Systems & IoT Hardware Engineering',
    tagline: 'Bridge software and physical hardware with Embedded C, RTOS, microcontrollers, and IoT protocols.',
    description: 'Crafted for electronics, electrical, and computer engineering students seeking direct industry-relevant embedded skills. Emphasizes hardware interfacing, sensor networks, RTOS task scheduling, and secure MQTT telemetry.',
    category: 'Embedded & IoT',
    level: 'Intermediate',
    audience: 'students',
    duration_weeks: 12,
    hours_per_week: 8,
    format: 'Virtual Simulation & Lab Hardware Kits',
    is_sample: true,
    key_skills: [
      'Embedded C & Register-Level Programming',
      'ARM Cortex-M & ESP32 Microcontrollers',
      'FreeRTOS Task Scheduling & Semaphores',
      'Communication Protocols: I2C, SPI, UART',
      'IoT Networking: MQTT, Wi-Fi, BLE',
      'Low-Power Embedded Design',
      'Hardware Debugging with Logic Analyzers',
    ],
    prerequisites: [
      'Basic understanding of C programming',
      'Fundamentals of digital logic and basic circuit theory',
      'Curiosity about microcontrollers and sensor hardware',
    ],
    modules: [
      {
        module_number: 1,
        title: 'Microcontroller Architecture & Bare-Metal Programming',
        description: 'Registers, clocks, GPIO configuration, interrupts, timers, and PWM control.',
        lessons: [
          { title: 'ARM Cortex Architecture & Memory Mapping', type: 'lecture', duration_min: 60 },
          { title: 'Interrupt Service Routines & Timer Hardware', type: 'lab', duration_min: 90 },
        ],
      },
      {
        module_number: 2,
        title: 'Serial Communication & Sensor Interfacing',
        description: 'Implementing drivers for I2C, SPI, and UART to interface IMUs, environmental sensors, and displays.',
        lessons: [
          { title: 'I2C and SPI Protocol Timing Analysis', type: 'lab', duration_min: 90 },
          { title: 'Writing Custom Device Drivers', type: 'lab', duration_min: 90 },
        ],
      },
      {
        module_number: 3,
        title: 'Real-Time Operating Systems (FreeRTOS) & Telemetry',
        description: 'Multi-task scheduling, mutexes, message queues, and connecting edge devices to cloud telemetry.',
        lessons: [
          { title: 'FreeRTOS Tasks, Priority Inversion & Queues', type: 'lecture', duration_min: 60 },
          { title: 'Secure MQTT Telemetry over TLS with ESP32', type: 'lab', duration_min: 90 },
        ],
      },
    ],
    projects: [
      {
        title: 'Industrial Environmental Monitoring Node',
        description: 'Low-power edge device gathering multi-sensor telemetry, logging to flash memory, and securely publishing alerts over MQTT.',
        tech_stack: ['Embedded C', 'FreeRTOS', 'ESP32', 'MQTT', 'Grafana'],
      },
    ],
  },
];

export async function fetchCourses(options?: {
  audience?: string;
  category?: string;
  search?: string;
}): Promise<CourseListResponse> {
  const queryParams = new URLSearchParams();
  if (options?.audience && options.audience !== 'all') {
    queryParams.append('audience', options.audience);
  }
  if (options?.category) {
    queryParams.append('category', options.category);
  }
  if (options?.search) {
    queryParams.append('search', options.search);
  }

  const url = `${API_BASE_URL}/courses?${queryParams.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Graceful fallback to embedded verified sample data
  }

  let filtered = FALLBACK_COURSES;
  if (options?.audience && options.audience !== 'all') {
    filtered = filtered.filter(
      (c) => c.audience === options.audience || c.audience === 'all'
    );
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.key_skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  return {
    total: filtered.length,
    items: filtered,
    sample_notice:
      "This catalog contains verified sample courses showcasing VIBHA's curriculum standards.",
  };
}

export async function fetchCourseBySlug(
  slug: string
): Promise<CourseDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/courses/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Graceful fallback
  }

  const found = FALLBACK_COURSES.find((c) => c.slug === slug);
  return found || null;
}

export async function submitEnquiry(
  data: EnquiryFormData
): Promise<EnquirySubmitResponse> {
  const res = await fetch(`${API_BASE_URL}/enquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseJson = await res.json();
  if (!res.ok) {
    let errorMsg = 'Failed to submit enquiry.';
    if (responseJson.detail) {
      if (Array.isArray(responseJson.detail)) {
        errorMsg = responseJson.detail
          .map((d: { msg?: string; message?: string }) => d.msg || d.message)
          .join(', ');
      } else if (typeof responseJson.detail === 'string') {
        errorMsg = responseJson.detail;
      }
    }
    throw new Error(errorMsg);
  }

  return responseJson;
}
