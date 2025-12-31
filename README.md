# ANDL Demo - CI/CD Pipeline

A minimal Node.js project used for ANDL PE demonstrations.

## Purpose

This repository serves as the **target project** for demonstrating ANDL's
autonomous SDLC capabilities. During the demo, ANDL will read `SPEC.md`
and generate a complete CI/CD pipeline.

## Current State

This is the "seed" state - a basic Node.js project with no CI/CD configuration.

```
├── package.json      # Project manifest
├── tsconfig.json     # TypeScript config
├── SPEC.md           # Design specification (demo input)
├── src/
│   └── index.ts      # Simple entry point
└── tests/
    └── index.test.ts # Basic test
```

## After ANDL Execution

After running the design spec through ANDL, this repo will contain:

```
├── .github/
│   ├── workflows/
│   │   └── ci.yml                    # Main CI workflow
│   └── actions/
│       └── coverage-check/
│           ├── action.yml            # Reusable action
│           └── check.sh              # Coverage script
├── docs/
│   ├── CI_SETUP.md                   # Usage documentation
│   └── CONTRIBUTING.md               # Contribution guide
└── ... (existing files)
```

## Running Locally

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm typecheck
```

## License

MIT
