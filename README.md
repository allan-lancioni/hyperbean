# finance-framework

Local-first development framework for ledger-based personal finance using Beancount + Node/TypeScript.

This repository contains:

- A reusable finance tooling layer
- An example Beancount ledger
- Importers and reporting utilities
- A Python runtime wrapper (`.venv`)
- AI-oriented operational rules (`agents.md`)

This is **not** a consumer application.  
It is a developer-focused framework designed for disciplined, versioned, ledger-first financial management.

---

# Scope

The framework provides:

- Deterministic ledger validation (`bean-check`)
- Python runtime isolation
- Structured imports
- Derived analytics (IRR, net worth)
- Fava integration
- External ledger support via CLI contract

Production ledgers are expected to live outside this repository.

---

# Architectural Principles

- Ledger-first
- External ledger support
- Deterministic validation
- Minimal configuration
- No SaaS dependencies
- Clear separation:
  - Ledger data
  - Runtime tooling
  - Imports
  - Analytics

---

# Ledger Path Contract

All commands support:

```bash
npm run <command> -- --ledger /path/to/main.bean
```

Resolution order:

1. `--ledger` argument
2. Fallback: `examples/personal-ledger/main.bean`

The framework must never hardcode ledger paths.

---

# Setup

Provision local Python environment:

```bash
npm run setup:py
```

This creates `.venv` and installs:

- beancount
- fava

No global Python packages are required after setup.

---

# Validation

Validate a ledger:

```bash
npm run validate -- --ledger /path/to/main.bean
```

Runs:

```
bean-check <ledger>
```

Validation must pass before committing ledger changes.

---

# Testing

The project uses Vitest for TypeScript unit tests.

Run all tests:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Current convention:

- Each `.ts` file in `packages/core`, `packages/importers`, and `packages/reports` has a corresponding `*.test.ts` file in the same directory.
- New scripts should follow the same `file.ts` + `file.test.ts` pairing.

---

# Development Mode

```bash
npm run dev -- --ledger /path/to/main.bean
```

Starts:

- Validation watcher
- Fava UI

Both target the provided ledger.

---

# Repository Structure

```text
finance-framework/
│
├── examples/
│   └── personal-ledger/
│       ├── main.bean
│       ├── core/
│       │   ├── accounts.bean
│       │   ├── commodities.bean
│       │   ├── opening_2026.bean
│       │   └── options.bean
│       ├── investments/
│       │   ├── dividends.bean
│       │   └── trades.bean
│       ├── prices/
│       │   └── prices.bean
│       ├── real_estate/
│       │   └── property_1.bean
│       └── transactions/
│           └── 2026.bean
│
├── imports/
│   ├── raw/
│   └── processed/
│
├── packages/
│   ├── core/
│   │   ├── py.ts
│   │   ├── setup-python.ts
│   │   └── validate.ts
│   │
│   ├── importers/
│   │   ├── import-b3.ts
│   │   └── import-nubank.ts
│   │
│   └── reports/
│       ├── irr.ts
│       ├── networth.ts
│       └── reports.ts
│
├── .venv/
├── package.json
├── tsconfig.json
├── agents.md
└── README.md
```

---

# Folder Definitions

## `examples/personal-ledger/`

Development-only example ledger.

### `main.bean`

Entrypoint file. Centralizes all `include` statements.

### `core/`

Static structural definitions:

- `options.bean` — Beancount options
- `commodities.bean` — Commodity declarations
- `accounts.bean` — Account hierarchy
- `opening_2026.bean` — Opening balances

### `transactions/`

Operational financial events.

### `investments/`

Asset purchases and income:

- `trades.bean`
- `dividends.bean`

### `real_estate/`

Real estate-related accounting.

### `prices/`

Price database (`prices.bean`).

---

## `imports/`

Data ingestion layer.

- `raw/` — Original bank/broker exports
- `processed/` — Normalized intermediate outputs

Importers must not directly mutate the ledger.

---

## `packages/core/`

Runtime infrastructure.

### `py.ts`

Executes Python binaries inside `.venv`.

### `setup-python.ts`

Creates `.venv` and installs Beancount + Fava.

### `validate.ts`

Runs `bean-check` against the provided ledger path.

All validation flows must use this module.

---

## `packages/importers/`

Domain-specific import logic.

- `import-b3.ts`
- `import-nubank.ts`

Importers:

- Read from `imports/raw/`
- Produce normalized outputs
- Do not directly commit ledger changes

---

## `packages/reports/`

Derived analytics.

- `irr.ts` — Internal Rate of Return calculations
- `networth.ts` — Net worth aggregation
- `reports.ts` — Aggregated reporting utilities

These scripts analyze ledger data but must not modify it.

---

# Required Agent Behavior

The AI agent must:

- Respect the `--ledger` contract
- Never hardcode ledger paths
- Always run validation after ledger modifications
- Maintain CLI compatibility
- Avoid structural changes without justification
- Keep separation between:
  - Ledger
  - Imports
  - Runtime
  - Reports

---

# Recommended Workflow

1. Place exports in `imports/raw/`
2. Run importer scripts
3. Review changes
4. Validate:
   ```bash
   npm run validate -- --ledger ...
   ```
5. Commit changes in the ledger repository
6. Use Fava for inspection

---

# Non-Goals

This project is not:

- A consumer finance app
- A SaaS platform
- An IDE fork
- A full financial operating system
- A packaged Electron product

It is a disciplined development framework for ledger-based finance management.
