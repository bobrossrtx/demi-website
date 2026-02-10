import React, { useState } from 'react';
import './FAQ.scss';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    {
      category: 'general',
      question: 'What is Demi?',
      answer: 'Demi is a modern programming language designed to combine the best features from various languages into one cohesive toolset. It focuses on simplicity, performance, and developer experience.'
    },
    {
      category: 'general',
      question: 'Is Demi ready for production use?',
      answer: 'No, Demi is currently in active development and not ready for production use. It\'s in the alpha stage and is being actively worked on. Check back regularly for updates on its progress.'
    },
    {
      category: 'general',
      question: 'Who is developing Demi?',
      answer: 'Demi is being developed by Owen Boreham with plans to bring in community members to help with the language\'s development in the future.'
    },
    {
      category: 'getting-started',
      question: 'How do I install Demi?',
      answer: 'You can download Demi from the Downloads page. We provide installers for Windows, macOS, and Linux. Follow the installation guide for your specific platform.'
    },
    {
      category: 'getting-started',
      question: 'What are the system requirements?',
      answer: 'Demi requires a 64-bit operating system (Windows 10+, macOS 11+, or a modern Linux distribution), at least 4GB of RAM, and approximately 500MB of disk space.'
    },
    {
      category: 'getting-started',
      question: 'How do I run my first Demi program?',
      answer: 'Create a file with a .demi extension, write your code, and run it using the `demi run` command. Check out the "First Program" guide in our documentation for a step-by-step tutorial.'
    },
    {
      category: 'language',
      question: 'What syntax does Demi use?',
      answer: 'Demi\'s syntax is heavily inspired by JavaScript, making it familiar to web developers. However, it includes unique features and improvements that set it apart.'
    },
    {
      category: 'language',
      question: 'Does Demi support object-oriented programming?',
      answer: 'Yes, Demi supports object-oriented programming concepts including classes, inheritance, and encapsulation, along with functional programming paradigms.'
    },
    {
      category: 'language',
      question: 'What types of applications can I build with Demi?',
      answer: 'While Demi is still in development, it\'s being designed for general-purpose programming including CLI tools, web applications, and system utilities.'
    },
    {
      category: 'community',
      question: 'How can I contribute to Demi?',
      answer: 'We welcome contributions! While the contribution process is still being formalized, you can follow the project, report issues, and stay tuned for opportunities to contribute code, documentation, or ideas.'
    },
    {
      category: 'community',
      question: 'Is there a community forum or chat?',
      answer: 'A community forum is currently being developed and will be available soon. This will allow users to discuss Demi, share projects, and get help from other developers.'
    },
    {
      category: 'community',
      question: 'How can I report bugs or request features?',
      answer: 'You can use the contact form to report bugs or request features. Once our community forum launches, there will also be dedicated channels for issue tracking and feature requests.'
    },
    {
      category: 'technical',
      question: 'What package manager does Demi use?',
      answer: 'Demi\'s package manager is still in development. Details about package management and dependency handling will be announced as the language matures.'
    },
    {
      category: 'technical',
      question: 'Does Demi compile to machine code or is it interpreted?',
      answer: 'Demi is designed as a compiled language for optimal performance. The compilation details and target platforms are part of the ongoing development.'
    },
    {
      category: 'technical',
      question: 'What IDE or editor should I use for Demi?',
      answer: 'While dedicated IDE support is being developed, you can use any text editor for now. Syntax highlighting and language server support are planned for popular editors like VS Code.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: 'fa-list' },
    { id: 'general', name: 'General', icon: 'fa-info-circle' },
    { id: 'getting-started', name: 'Getting Started', icon: 'fa-rocket' },
    { id: 'language', name: 'Language Features', icon: 'fa-code' },
    { id: 'community', name: 'Community', icon: 'fa-users' },
    { id: 'technical', name: 'Technical', icon: 'fa-cog' }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-hero">
        <div className="hero-icon">
          <i className="fas fa-question-circle"></i>
        </div>
        <h1>Frequently Asked Questions</h1>
        <p className="hero-subtitle">
          Find answers to common questions about Demi
        </p>
      </div>

      <div className="faq-container">
        <aside className="faq-categories">
          <h3>Categories</h3>
          <ul className="category-list">
            {categories.map(category => (
              <li key={category.id}>
                <button
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <i className={`fas ${category.icon}`}></i>
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="faq-content">
          <div className="faq-header">
            <h2>
              {categories.find(c => c.id === selectedCategory)?.name || 'All Questions'}
            </h2>
            <p className="faq-count">
              {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'}
            </p>
          </div>

          <div className="faq-list">
            {filteredFAQs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${expandedIndex === index ? 'expanded' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleExpand(index)}
                >
                  <span className="question-text">{faq.question}</span>
                  <i className={`fas fa-chevron-${expandedIndex === index ? 'up' : 'down'}`}></i>
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="faq-footer">
            <div className="help-card">
              <i className="fas fa-life-ring"></i>
              <h3>Still have questions?</h3>
              <p>
                Can't find what you're looking for? Reach out to us through the contact page 
                or join our community forum when it launches.
              </p>
              <a href="/contact" className="help-btn">
                <i className="fas fa-envelope"></i>
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
