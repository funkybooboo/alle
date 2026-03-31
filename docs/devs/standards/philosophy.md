# Development Philosophy

This document defines the core development principles for Alle. These are **non-negotiable** — they apply to every feature, every release, every commit.

---

## Feature by Feature

The roadmap is the north star — a grand design to keep in mind — but we never build the grand design up front. We implement one small feature at a time, always working on the simplest thing that adds real value. No speculative abstractions, no "while we're in here" scope creep.

---

## Strict TDD — Red → Green → Refactor

1. **Red:** Write a failing test that describes the behavior you want. Don't write any production code yet.
2. **Green:** Write the minimum code needed to make the test pass. Ugly is fine here.
3. **Refactor:** Clean up the implementation — extract functions, apply patterns, improve names — while keeping all tests green.

This cycle repeats for every piece of functionality, no matter how small.

**Refactor after every implementation.** After the test goes green, always do a refactor pass before moving on. Keep the code clean, extensible, and free of duplication. The refactor step is not optional.

---

## Core Principles

These apply across every release, not just the ones where they're most obvious:

- **TDD**: Tests are written before implementation. Unit tests first, then integration/E2E.
- **Documentation**: User docs and dev docs updated alongside code. ADRs written for every significant decision.
- **Security**: Security considerations addressed in each release, not bolted on at the end.
- **Extensibility**: Every major subsystem is defined as an interface first; concrete adapters implement it.
- **Accessibility**: WCAG 2.1 AA is the target; a11y work runs continuously, not just in a dedicated release.
