# Tax Deduction Finder

> Scan expenses and identify missed tax deductions and credits

## Who This Is For

💰 Finance/Everyone

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| TaxPro | Writer | Domain expert for tax deduction finder |
| ReceiptHunter | Grader | Domain expert for tax deduction finder |
| Maximizer | Updater | Domain expert for tax deduction finder |

## How It Works

1. **Write** — TaxPro reads `spec.md` and produces the first draft
2. **Grade** — ReceiptHunter evaluates the output (1-100 score)
3. **Update** — If score < 90%, Maximizer improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

Jordan (freelance designer, $87K income) was taking the standard deduction and missing business write-offs. The agents found $9,847 in Schedule C deductions including home office ($1,500), mileage ($831), and software ($660). Result: $1,379 in self-employment tax savings + identified $312 overpayment refund. Total savings: $1,691.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
