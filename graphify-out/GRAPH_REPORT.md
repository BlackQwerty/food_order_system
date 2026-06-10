# Graph Report - .  (2026-06-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 28 nodes · 104 edges · 10 communities (2 shown, 8 thin omitted)
- Extraction: 28% EXTRACTED · 72% INFERRED · 0% AMBIGUOUS · INFERRED: 75 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1eac9aaf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Order and Cart Pages|Order and Cart Pages]]
- [[_COMMUNITY_User Authentication Dashboard|User Authentication Dashboard]]
- [[_COMMUNITY_Staff Dashboard|Staff Dashboard]]
- [[_COMMUNITY_Assignment 2|Assignment 2]]
- [[_COMMUNITY_ClickEat Project|ClickEat Project]]
- [[_COMMUNITY_Mini Project|Mini Project]]
- [[_COMMUNITY_Order Items Table|Order Items Table]]
- [[_COMMUNITY_Shukri|Shukri]]
- [[_COMMUNITY_Color Palette|Color Palette]]
- [[_COMMUNITY_Typography|Typography]]

## God Nodes (most connected - your core abstractions)
1. `Menu Page` - 13 edges
2. `Login Page` - 13 edges
3. `Home Page` - 12 edges
4. `Dashboard Page` - 12 edges
5. `Order Confirmation Page` - 12 edges
6. `Piji` - 11 edges
7. `Makdi` - 11 edges
8. `Apek` - 11 edges
9. `Primary Button Style` - 11 edges
10. `Card Component` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Piji` --implements--> `Dashboard Page`  [INFERRED]
  CONTEXT.md → history.html
- `Piji` --implements--> `Home Page`  [INFERRED]
  CONTEXT.md → index.html
- `Piji` --implements--> `Login Page`  [INFERRED]
  CONTEXT.md → login.html
- `Piji` --implements--> `Register Page`  [INFERRED]
  CONTEXT.md → register.html
- `Piji` --implements--> `Staff Dashboard Page`  [INFERRED]
  CONTEXT.md → staff-history.html

## Import Cycles
- None detected.

## Communities (10 total, 8 thin omitted)

### Community 0 - "Order and Cart Pages"
Cohesion: 0.67
Nodes (9): Cart Page, Navigation Bar, Orders Table, Piji, Card Component, Menu Page, Order Confirmation Page, Order Checkout Page (+1 more)

### Community 1 - "User Authentication Dashboard"
Cohesion: 0.69
Nodes (9): Apek, Makdi, Users Table, Dashboard Page, Primary Button Style, Home Page, Login Page, Register Page (+1 more)

## Knowledge Gaps
- **8 isolated node(s):** `ClickEat`, `Assignment 2`, `Mini Project`, `Iki`, `Shukri` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Login Page` connect `User Authentication Dashboard` to `Order and Cart Pages`, `Staff Dashboard`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `Dashboard Page` connect `User Authentication Dashboard` to `Order and Cart Pages`, `Staff Dashboard`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `Tracking Page` connect `User Authentication Dashboard` to `Order and Cart Pages`, `Staff Dashboard`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Menu Page` (e.g. with `Apek` and `Makdi`) actually correct?**
  _`Menu Page` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `Login Page` (e.g. with `Apek` and `Makdi`) actually correct?**
  _`Login Page` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `Home Page` (e.g. with `Apek` and `Makdi`) actually correct?**
  _`Home Page` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `Dashboard Page` (e.g. with `Apek` and `Makdi`) actually correct?**
  _`Dashboard Page` has 7 INFERRED edges - model-reasoned connections that need verification._