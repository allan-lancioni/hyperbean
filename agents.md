# finance-framework — Agent Rules

The agent maintains this repository under strict validation and CLI stability.

---

## Configuration Priority

Before modifying ledger data, read from the ledger folder specified on Ledger Path Contract:

1. `{{ledger_path}}/preferences.json` (highest priority)
2. `{{ledger_path}}/rules.md`

Never hardcode behavior that conflicts with these files.

---

## Ledger Path Contract

All commands must support:

```bash
npm run <command> -- --ledger /path/to/main.bean
```

Rules:

- Always propagate `--ledger`.
- Never assume a fixed ledger path.
- Use fallback example ledger only if no path is provided.

---

## Mandatory Execution Loop

### If modifying `.bean` files:

1. Apply change.
2. Run:

   ```bash
   npm run validate -- --ledger <path>
   ```

3. Fix until validation passes.
4. Do not finish with failing validation.

Validation is required after every ledger change.

---

### If modifying framework code (`packages/**`, config `.json`):

1. Apply change.
2. Run:

   ```bash
   npm test
   ```

3. If CLI or ledger resolution changed, also run validate.
4. Do not finish with failing tests.

---

## Validation Rules

- `npm run validate` must execute `bean-check`.
- Repository must never be left in an invalid state.

---

## Boundaries

The agent must not:

- Modify `imports/raw/`
- Modify `.venv/`
- Hardcode ledger paths
- Introduce unnecessary dependencies

---

## Response Format

Every response must include:

1. Summary of changes
2. Files modified
3. Commands executed
4. Validation result
5. Test result (if applicable)
```
