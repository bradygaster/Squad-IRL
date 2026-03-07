# Vet Appointment Prep

> Prepare for vet visits with symptom logs and questions to ask

## Who This Is For

🐕 Pet Owners

## The Team

| Agent | Role | What They Do |
|-------|------|-------------|
| PetAdvocate | Writer | Domain expert for vet appointment prep |
| SymptomLogger | Grader | Domain expert for vet appointment prep |
| QuestionGenerator | Updater | Domain expert for vet appointment prep |

## How It Works

1. **Write** — PetAdvocate reads `spec.md` and produces the first draft
2. **Grade** — SymptomLogger evaluates the output (1-100 score)
3. **Update** — If score < 90%, QuestionGenerator improves the output
4. **Repeat** — Loop continues until quality threshold is met

## See It In Action

You walk into the vet and blank on when the limping started or what brand of food you switched to. This squad turns your scattered observations into a structured symptom timeline, generates breed-specific questions to ask the vet, and flags which details actually matter for diagnosis. Go from "um, he's been acting weird" to a prepared pet parent who gets answers in a single visit.

> 📄 **[See the full example output →](examples/sample-output.md)**

## Running This Sample

```bash
npm install
npm start
```

## Output

Results are saved in the `output/` directory.
