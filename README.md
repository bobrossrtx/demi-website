# Demi Programming Language Website

The official website and documentation for the Demi programming language.

## 🚀 Overview

This repository contains the source code for the Demi programming language's official website and documentation. The website serves as the primary resource for learning and understanding Demi.

## 📁 Project Structure

```
demi-website/
├── frontend/           # React frontend application
├── backend/           # Backend static content
│   └── static/
│       └── docs/     # Documentation markdown files
└── .github/
    └── prompts/      # Documentation generation prompts
```

## 🛠️ Development

### Prerequisites
- Node.js
- npm/yarn
- Git
- Rust (latest stable)
- cargo

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/demi-website.git
cd demi-website

# Install Node dependencies (in /frontend directory)
cd frontend
npm install

# Install Rust dependencies (in /backend directory)
cd ../backend
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup update stable
cargo build --release
```

### Development Environment
```bash
# Terminal 1 - Watch frontend changes (in /frontend directory)
cd demi-website
npm run watch-build

# Terminal 2 - Watch Rust changes (in /backend directory)
cd backend
cargo watch -x run
```

### Directory-Specific Commands
- Frontend (`/frontend` directory):
  ```bash
  npm install        # Install dependencies
  npm run build     # Build for production
  ```

- Backend (`/backend` directory):
  ```bash
  cargo build       # Build Rust components
  cargo watch -x run # Watch for changes
  cargo test        # Run tests
  ```

## 📚 Documentation

Documentation is written in Markdown and organized by categories:
- Getting Started (catid: 0)
- Basics (catid: 1)
- Advanced (catid: 2)
- Standard Library (catid: 3)
- Tools & Ecosystem (catid: 4)

### Adding New Documentation
1. Use the documentation generator prompt
2. Create new markdown file in appropriate category
3. Update pages.json with new entry
4. Update changelog

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📋 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Demi Language Repository](https://github.com/bobrossrtx/demi-lang)
- [Documentation](https://demi-website.fly.dev/docs)
