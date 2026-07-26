# Contributing to AccessAudit

Thank you for considering contributing to AccessAudit! We welcome all contributions, including bug fixes, feature enhancements, documentation improvements, and more.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How to Contribute](#how-to-contribute)
3. [Setting Up the Development Environment](#setting-up-the-development-environment)
4. [Development Workflow](#development-workflow)
5. [Commit Message Guidelines](#commit-message-guidelines)
6. [Pull Request Guidelines](#pull-request-guidelines)
7. [Code Review Process](#code-review-process)
8. [Issue Guidelines](#issue-guidelines)
9. [Documentation](#documentation)
10. [Testing](#testing)
11. [License](#license)

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How to Contribute

### 1. Fork the Repository

Fork the repository to your own GitHub account and clone it locally:

```bash
git clone https://github.com/your-username/AccessAudit.git
cd AccessAudit
```

### 2. Create a Branch

Create a new branch for your contribution:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Changes

Make your changes following the [development specifications](doc/development-spec.md).

### 4. Commit Your Changes

Commit your changes with a meaningful commit message following our [guidelines](#commit-message-guidelines).

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

Open a pull request from your branch to the main repository's `develop` branch.

## Setting Up the Development Environment

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Playwright browsers (for behavioral testing)

### Installation

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Install Playwright browsers
npx playwright install
```

### Development Commands

```bash
# Run all tests
npm run test

# Run linting
npm run lint

# Format code
npm run format

# Build specific package
npm run build --workspace=@accessaudit/cli

# Start API server
npm run start:api

# Start Web development server
npm run start:web
```

## Development Workflow

### Branch Structure

- `main`: Stable production-ready code
- `develop`: Development branch for new features
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches
- `release/*`: Release preparation branches

### Workflow

1. Create a feature/fix branch from `develop`
2. Make changes and commit
3. Push to your fork
4. Create a pull request to `develop`
5. After review and approval, merge to `develop`
6. Periodically, `develop` is merged to `main` for releases

## Commit Message Guidelines

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(scanner): add custom rule support` |
| `fix` | Bug fix | `fix(agent): fix keyboard trap detection` |
| `docs` | Documentation update | `docs(api): update API documentation` |
| `style` | Code style (formatting, etc.) | `style: format code with prettier` |
| `refactor` | Code refactoring | `refactor(engine): simplify task generation` |
| `test` | Tests | `test(scanner): add unit tests` |
| `chore` | Build/tool changes | `chore: update dependencies` |

### Scopes

| Scope | Description |
|-------|-------------|
| `scanner` | Static scan engine |
| `agent` | Behavioral test engine |
| `engine` | Smart task engine |
| `cli` | Command-line interface |
| `sdk` | Software development kit |
| `api` | REST API server |
| `web` | Web UI dashboard |
| `report` | Report generator |
| `config` | Configuration |
| `docs` | Documentation |

### Examples

```
feat(scanner): add custom rule registration

- Add registerCustomRule method to AxeScanner
- Support custom rule evaluation function
- Add validation for rule configuration

Closes #123
```

```
fix(agent): fix keyboard trap detection logic

- Fix focusable element detection in modals
- Improve Tab navigation simulation
- Add timeout handling for focus loop detection

Closes #124
```

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the [development specifications](doc/development-spec.md)
- [ ] All tests pass (`npm run test`)
- [ ] Code passes linting (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Commit messages follow the [guidelines](#commit-message-guidelines)
- [ ] Documentation is updated if needed
- [ ] Related issues are referenced in the PR description

### PR Description

Provide a clear description of your changes:

1. **Summary**: What does this PR do?
2. **Changes**: List the key changes made
3. **Testing**: How was this tested?
4. **Related Issues**: Link to any related issues

### Review Process

1. PR is submitted and CI runs automatically
2. At least one reviewer is assigned
3. Reviewer provides feedback
4. Changes are made if needed
5. PR is approved and merged

## Code Review Process

### Review Levels

| Level | Scenario | Reviewers |
|-------|----------|-----------|
| **Primary** | Small features, docs, tests | 1 reviewer |
| **Secondary** | Core features, API changes, refactoring | 2 reviewers |
| **Tertiary** | Architecture changes, major refactoring, security | 3 reviewers (including tech lead) |

### Review Criteria

- **Code Quality**: Follows TypeScript standards, no `any` types, proper error handling
- **Security**: No hardcoded secrets, proper input validation
- **Performance**: No unnecessary loops, no memory leaks
- **Maintainability**: Proper naming, code comments for complex logic, test coverage

## Issue Guidelines

### Reporting Bugs

When reporting a bug, include:

1. **Title**: Clear and descriptive
2. **Description**: What happened?
3. **Steps to Reproduce**: Detailed steps to reproduce the issue
4. **Expected Behavior**: What should have happened?
5. **Actual Behavior**: What actually happened?
6. **Environment**: Node.js version, browser, OS
7. **Logs**: Any relevant logs or error messages

### Requesting Features

When requesting a feature, include:

1. **Title**: Clear and descriptive
2. **Description**: What feature do you want?
3. **Use Case**: Why do you need this feature?
4. **Benefits**: How will this benefit the project?
5. **Implementation Ideas**: Any ideas for implementation (optional)

## Documentation

Documentation is an important part of the project. Please update the following when making changes:

- `README.md`: Main project documentation
- `doc/`: Additional documentation
- Code comments for complex logic

## Testing

### Types of Tests

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test interactions between modules
- **End-to-End Tests**: Test the complete flow

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for a specific package
npm run test --workspace=@accessaudit/core

# Run tests with coverage
npm run test -- --coverage
```

### Writing Tests

- Follow the existing test patterns
- Add tests for new functionality
- Update tests when modifying existing code
- Aim for high test coverage

## License

By contributing to AccessAudit, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## Questions?

If you have any questions, feel free to open an issue or reach out to the maintainers.

Thank you for contributing! 🎉
