# Subagent tasking for reviews

## Default Inspections

Eliminate redundant code, de-duplicate shared routines across components, tighten verbose code to reduce line
count while preserving full functionality and accessibility, and centralize all remaining in-line strings.

- In-Line Strings: All hardcoded labels, titles, aria-labels, and descriptions that need to be centralized.
- De-Duplication: Repeated UI markup, duplicate calculations, and duplicated constants across components.
- Code Tightening: Opportunities to eliminate boilerplate and reduce line counts without compromising
  accessibility (WCAG), performance, or functionality.
- Compliance: Ensuring all comments, strings and logic remain value-agnostic and use accurate technical terminology
  and sentence case.
