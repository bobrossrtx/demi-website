/**
 * Unified search data combining FAQ items and docs
 * This file helps with centralized search indexing
 */

import { SearchableItem } from './searchUtil';

/**
 * Convert FAQ items to searchable format
 */
export const faqItems: SearchableItem[] = [
  {
    id: 'what-is-demi',
    title: 'What is Demi?',
    description: 'Demi is a modern programming language designed to combine the best features from various languages into one cohesive toolset.',
    content: 'Demi is a modern programming language designed to combine the best features from various languages into one cohesive toolset. It focuses on simplicity, performance, and developer experience.',
    tags: ['basics', 'introduction', 'overview'],
    category: 'general',
    type: 'faq',
    url: '/faq#what-is-demi'
  },
  {
    id: 'production-ready',
    title: 'Is Demi ready for production use?',
    description: 'Demi is currently in active development and not ready for production use. It\'s in the alpha stage.',
    content: 'No, Demi is currently in active development and not ready for production use. It\'s in the alpha stage and is being actively worked on. Check back regularly for updates on its progress.',
    tags: ['status', 'release', 'alpha'],
    category: 'general',
    type: 'faq',
    url: '/faq#production-ready'
  },
  {
    id: 'developer',
    title: 'Who is developing Demi?',
    description: 'Demi is being developed by Owen Boreham with community members.',
    content: 'Demi is being developed by Owen Boreham with plans to bring in community members to help with the language\'s development in the future.',
    tags: ['team', 'author', 'maintainer'],
    category: 'general',
    type: 'faq',
    url: '/faq#developer'
  },
  {
    id: 'installation',
    title: 'How do I install Demi?',
    description: 'You can download Demi from the Downloads page. We provide installers for Windows, macOS, and Linux.',
    content: 'You can download Demi from the Downloads page. We provide installers for Windows, macOS, and Linux. Follow the installation guide for your specific platform.',
    tags: ['setup', 'download', 'install', 'platform'],
    category: 'getting-started',
    type: 'faq',
    url: '/faq#installation'
  },
  {
    id: 'system-requirements',
    title: 'What are the system requirements?',
    description: 'Demi requires a 64-bit operating system, at least 4GB of RAM, and approximately 500MB of disk space.',
    content: 'Demi requires a 64-bit operating system (Windows 10+, macOS 11+, or a modern Linux distribution), at least 4GB of RAM, and approximately 500MB of disk space.',
    tags: ['requirements', 'specs', 'hardware', 'os'],
    category: 'getting-started',
    type: 'faq',
    url: '/faq#system-requirements'
  },
  {
    id: 'first-program',
    title: 'How do I run my first Demi program?',
    description: 'Create a file with a .demi extension, write your code, and run it using the demi run command.',
    content: 'Create a file with a .demi extension, write your code, and run it using the `demi run` command. Check out the "First Program" guide in our documentation for a step-by-step tutorial.',
    tags: ['tutorial', 'hello-world', 'basics', 'beginner'],
    category: 'getting-started',
    type: 'faq',
    url: '/faq#first-program'
  },
  {
    id: 'syntax',
    title: 'What syntax does Demi use?',
    description: 'Demi\'s syntax is heavily inspired by JavaScript, making it familiar to web developers.',
    content: 'Demi\'s syntax is heavily inspired by JavaScript, making it familiar to web developers. However, it includes unique features and improvements that set it apart.',
    tags: ['syntax', 'grammar', 'code', 'javascript'],
    category: 'language',
    type: 'faq',
    url: '/faq#syntax'
  },
  {
    id: 'oop-support',
    title: 'Does Demi support object-oriented programming?',
    description: 'Yes, Demi supports object-oriented programming concepts including classes, inheritance, and encapsulation.',
    content: 'Yes, Demi supports object-oriented programming concepts including classes, inheritance, and encapsulation, along with functional programming paradigms.',
    tags: ['object-oriented', 'oop', 'classes', 'inheritance'],
    category: 'language',
    type: 'faq',
    url: '/faq#oop-support'
  },
  {
    id: 'app-types',
    title: 'What types of applications can I build with Demi?',
    description: 'Demi is being designed for general-purpose programming including CLI tools, web applications, and system utilities.',
    content: 'While Demi is still in development, it\'s being designed for general-purpose programming including CLI tools, web applications, and system utilities.',
    tags: ['applications', 'use-cases', 'cli', 'web'],
    category: 'language',
    type: 'faq',
    url: '/faq#app-types'
  },
  {
    id: 'contribute',
    title: 'How can I contribute to Demi?',
    description: 'We welcome contributions! You can follow the project, report issues, and contribute code, documentation, or ideas.',
    content: 'We welcome contributions! While the contribution process is still being formalized, you can follow the project, report issues, and stay tuned for opportunities to contribute code, documentation, or ideas.',
    tags: ['contributing', 'github', 'open-source', 'help'],
    category: 'community',
    type: 'faq',
    url: '/faq#contribute'
  },
  {
    id: 'community-forum',
    title: 'Is there a community forum or chat?',
    description: 'A community forum is currently being developed and will be available soon.',
    content: 'A community forum is currently being developed and will be available soon. This will allow users to discuss Demi, share projects, and get help from other developers.',
    tags: ['forum', 'community', 'chat', 'discussion'],
    category: 'community',
    type: 'faq',
    url: '/faq#community-forum'
  },
  {
    id: 'report-bugs',
    title: 'How can I report bugs or request features?',
    description: 'You can use the contact form to report bugs or request features.',
    content: 'You can use the contact form to report bugs or request features. Once our community forum launches, there will also be dedicated channels for issue tracking and feature requests.',
    tags: ['bugs', 'features', 'issues', 'feedback'],
    category: 'community',
    type: 'faq',
    url: '/faq#report-bugs'
  },
  {
    id: 'package-manager',
    title: 'What package manager does Demi use?',
    description: 'Demi\'s package manager is still in development.',
    content: 'Demi\'s package manager is still in development. Details about package management and dependency handling will be announced as the language matures.',
    tags: ['packages', 'dependencies', 'npm', 'manager'],
    category: 'technical',
    type: 'faq',
    url: '/faq#package-manager'
  },
  {
    id: 'compilation',
    title: 'Does Demi compile to machine code or is it interpreted?',
    description: 'Demi is designed as a compiled language for optimal performance.',
    content: 'Demi is designed as a compiled language for optimal performance. The compilation details and target platforms are part of the ongoing development.',
    tags: ['compiler', 'compiled', 'machine-code', 'performance'],
    category: 'technical',
    type: 'faq',
    url: '/faq#compilation'
  },
  {
    id: 'editor-support',
    title: 'What IDE or editor should I use for Demi?',
    description: 'You can use any text editor for now. Syntax highlighting and language server support are planned.',
    content: 'While dedicated IDE support is being developed, you can use any text editor for now. Syntax highlighting and language server support are planned for popular editors like VS Code.',
    tags: ['ide', 'editor', 'vscode', 'syntax-highlighting'],
    category: 'technical',
    type: 'faq',
    url: '/faq#editor-support'
  }
];
