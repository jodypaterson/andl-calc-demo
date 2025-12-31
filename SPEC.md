# UOW: GitHub Action - Node.js CI/CD Pipeline

## Objective

Create a reusable GitHub Action for Node.js projects that provides
comprehensive CI/CD automation with test coverage enforcement.

## Functional Requirements

### 1. Workflow Triggers

- Run on push to `main` branch
- Run on pull requests targeting `main`
- Allow manual trigger via `workflow_dispatch`

### 2. Test Matrix

- Execute tests across Node.js versions: 18, 20, 22
- Run on ubuntu-latest
- Fail fast disabled (complete all matrix jobs even if one fails)

### 3. Build Steps (per matrix job)

1. Checkout repository
2. Setup Node.js with caching
3. Install dependencies (pnpm preferred, npm fallback)
4. Run TypeScript type checking
5. Execute unit tests with coverage
6. Upload coverage report as artifact

### 4. Coverage Enforcement

- Generate coverage report (lcov format)
- Extract coverage percentage from report
- Fail if coverage drops below configurable threshold (default: 80%)
- Post coverage summary as PR comment (if PR context)

### 5. Reusable Action

- Create `action.yml` for use in other repositories
- Accept inputs: node-versions, coverage-threshold, package-manager
- Provide outputs: coverage-percentage, test-passed

## Deliverables

1. `.github/workflows/ci.yml` - Main workflow file
2. `.github/actions/coverage-check/action.yml` - Reusable action
3. `.github/actions/coverage-check/check.sh` - Coverage threshold script
4. `docs/CI_SETUP.md` - Usage documentation
5. `docs/CONTRIBUTING.md` - How to modify the CI

## Acceptance Criteria

- [ ] Workflow runs successfully on push to main
- [ ] Test matrix executes across all 3 Node versions
- [ ] Coverage report generated and uploaded
- [ ] Coverage threshold enforcement works (blocks PR if below)
- [ ] Documentation explains all configuration options
- [ ] Reusable action can be imported by other repos

## Technical Constraints

- Use GitHub Actions native features (no external action dependencies beyond official actions/*)
- Shell scripts must be POSIX-compliant (sh, not bash-specific)
- YAML must pass yamllint validation
- Documentation in Markdown format

## Agent Assignments (Reference)

This spec is designed for multi-agent execution:

| Agent | Responsibility |
|-------|----------------|
| @architect | Decompose into atomic tasks, validate structure |
| @dev | Write YAML workflows and shell scripts |
| @qa | Validate coverage logic, test edge cases |
| @docs | Write CI_SETUP.md and CONTRIBUTING.md |

## Expected Decomposition (~10 tasks)

1. Create workflow skeleton with triggers
2. Add Node.js matrix configuration  
3. Implement dependency installation step
4. Add TypeScript compilation check
5. Configure test execution with coverage
6. Create coverage threshold script
7. Build reusable action.yml wrapper
8. Create CI_SETUP.md documentation
9. Create CONTRIBUTING.md
10. End-to-end validation run
