## Language and Descriptions

- Descriptions must be short, neutral, and consistent (no emojis).
- Avoid redundant wording.

---

## Account Creation Policy

- Do not create new accounts silently.
- If an account is missing:
  - Propose the new account.
  - Add it to the appropriate `accounts.bean` file.
- Follow existing account hierarchy patterns.

---

## Property-Specific Policy

### Properties in scope
- `PROPERTY_1`

### CAPEX vs OPEX (portfolio policy)
- CAPEX: improvements that increase value or extend useful life → capitalize to the property asset account.
- OPEX: maintenance/recurring costs to keep the property operating → expense under the property OPEX account.

If ambiguous, default to OPEX and flag the entry for review.

---

## Installments (If Applicable)

- For installment purchases, record:
  - the purchase date as the economic event date
  - the liability under the credit card account
- If the exact installment schedule is unknown, record as a single liability and add a note for later refinement.

---

## Account Aliases (Portfolio Overrides)

If the following terms appear, prefer these accounts (unless context indicates otherwise):

- "condo", "condominium", "HOA" → `Expenses:Housing:Condo:Property1:OPEX`
- "rent", "tenant" → `Income:RealEstate:Rent:Property1`

---

## Notes

- Do not add new portfolio rules here unless they are specific to this ledger and would not apply to other users.
