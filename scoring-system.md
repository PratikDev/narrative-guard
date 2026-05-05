# NarrativeGuard Scoring System

## Summary

NarrativeGuard scores each content piece from `0` to `100` based on how well it matches the brand's stored Brand Constitution.

The score is AI-judged but rule-grounded. The AI judge receives the content, the most relevant Brand Constitution clauses from Convex vector search, and a strict scoring rubric. It returns structured output that is stored in Convex.

## Verdict Thresholds

| Score | Verdict | Meaning |
|---:|---|---|
| `80-100` | `on_brand` | Content is aligned and safe to publish |
| `50-79` | `needs_review` | Content has noticeable drift or weak alignment |
| `0-49` | `off_brand` | Content conflicts with the Brand Constitution or carries material risk |

## Stored Result Shape

Each scored content item creates a `coherenceResults` row.

```ts
{
  jobId: Id<"auditJobs">,
  contentPieceId: Id<"contentPieces">,
  score: number,
  verdict: "on_brand" | "needs_review" | "off_brand",
  flaggedSentences: string[],
  flagReasons: string[],
  retrievedClauseIds: Id<"constitutionChunks">[],
  retrievedClausesSnapshot: string[],
  rewriteSuggestion: string,
  judgedAt: number
}
```

## Scoring Dimensions

The judge scores across five dimensions.

| Dimension | Points | What It Checks |
|---|---:|---|
| Tone alignment | 25 | Whether the copy matches the brand's desired tone |
| Messaging alignment | 25 | Whether the copy supports the brand's approved messaging pillars |
| Banned phrase safety | 20 | Whether the copy avoids banned phrases, claims, or framing |
| Audience fit | 15 | Whether the copy is appropriate for the target audience |
| Clarity and trust | 15 | Whether the copy is clear, credible, responsible, and not misleading |
| **Total** | **100** |  |

## Dimension Details

### Tone Alignment: 25 points

Checks whether the content sounds like the brand.

Examples:

- Warm vs. cold
- Confident vs. aggressive
- Expert vs. condescending
- Accessible vs. overly technical
- Premium vs. discount-driven

### Messaging Alignment: 25 points

Checks whether the content reinforces the brand's approved strategic message.

The judge should look for:

- Alignment with messaging pillars
- Consistency with positioning
- No contradiction of brand promises
- No emphasis on themes the brand intentionally avoids

### Banned Phrase Safety: 20 points

Checks whether the copy uses explicitly banned words, claims, or framing.

Examples:

- Banned words such as `cheap`, `guaranteed`, or `effortless`
- Prohibited claims
- Unsupported superlatives
- Compliance-sensitive phrases

This dimension has strong penalty caps because banned language can create reputational or legal risk.

### Audience Fit: 15 points

Checks whether the content is appropriate for the intended audience.

The judge should consider:

- Reading level
- Cultural sensitivity
- Formality
- User context
- Whether the message respects the audience's needs or constraints

### Clarity And Trust: 15 points

Checks whether the content is understandable and credible.

The judge should penalize:

- Overpromising
- Manipulative urgency
- Confusing claims
- Unsupported guarantees
- Vague value propositions

## Penalty Caps

Penalty caps prevent severely problematic content from receiving a high score just because it performs well on other dimensions.

| Condition | Maximum Score |
|---|---:|
| A banned phrase appears once | `79` |
| Multiple banned phrases appear | `65` |
| Content contradicts a core messaging pillar | `60` |
| Content includes legally risky, misleading, or unsupported claims | `49` |
| Content is empty, unreadable, or mostly boilerplate | `30` |
| No relevant brand context is retrieved | `75` |

The final score should be the lower of:

1. The rubric-based score.
2. Any applicable penalty cap.

## Judgment Flow

```txt
Content piece is stored
  |
  v
Generate embedding for content text
  |
  v
Retrieve top Brand Constitution clauses from Convex vector search
  |
  v
Send content + clauses + rubric to brandJudgeAgent
  |
  v
Agent returns structured score result
  |
  v
Apply or verify penalty caps
  |
  v
Store coherenceResults row
```

## Judge Prompt Requirements

The scoring prompt should require the agent to return structured JSON only.

The output must include:

- `score`
- `verdict`
- `flaggedSentences`
- `flagReasons`
- `rewriteSuggestion`

The prompt should instruct the judge to:

- Quote flagged sentences exactly from the content.
- Give one reason per flagged sentence.
- Use retrieved clauses as the source of truth.
- Apply penalty caps.
- Avoid inventing brand rules not present in the retrieved clauses.
- Produce a rewrite that preserves the original intent while making the copy compliant.

## Example

Brand Constitution:

```txt
Tone: warm, helpful, confident.
Banned phrases: cheap, guaranteed, effortless.
Messaging pillar: value through trust and accessibility.
```

Content:

```txt
Get this cheap data plan now. Guaranteed savings for everyone.
```

Expected result:

```json
{
  "score": 42,
  "verdict": "off_brand",
  "flaggedSentences": [
    "Get this cheap data plan now.",
    "Guaranteed savings for everyone."
  ],
  "flagReasons": [
    "Uses the banned phrase 'cheap' and frames the offer in a transactional tone.",
    "Makes an unsupported guarantee that may create trust and compliance risk."
  ],
  "rewriteSuggestion": "Get exceptional value on a data plan designed to keep you connected with confidence."
}
```

## Report-Level Scoring

The BuildFest version should use a simple average across all scored content pieces.

```ts
const overallScore =
  results.length === 0
    ? 100
    : results.reduce((sum, result) => sum + result.score, 0) / results.length;
```

Optional future weighting:

| Content Type | Weight |
|---|---:|
| Website page | `1.5x` |
| Press release | `1.5x` |
| Social post | `1.0x` |
| Ad creative | `1.3x` |
| High-traffic page | `2.0x` |

For the first build, use the simple average because it is easier to explain and demo.

## Quality Controls

To keep scoring consistent:

- Use the same rubric in every judge call.
- Store retrieved clause snapshots with the score.
- Use structured output validation.
- Keep temperature low for judge tasks.
- Add test cases with known expected score bands.
- Review score distribution after demo runs and adjust penalty caps if needed.

