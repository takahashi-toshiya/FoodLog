# Repository Guidelines

## Project Structure & Module Organization

This repository contains an Expo and React Native application. Keep the top level limited to project configuration and documentation. Place application code in `src/`, tests in `tests/`, and static resources in `assets/`. The browser-only UI reference lives in `prototype/` and is not production application code.

Organize `src/` by feature—for example, `src/meals/`, `src/foods/`, and `src/shared/`. Keep feature-specific tests in matching paths such as `tests/meals/`, or colocate them if the framework favors that convention. Do not commit generated output, dependencies, or local data.

## Build, Test, and Development Commands

Use npm with Node.js 22 LTS. The standard commands are:

- `make dev` — start the Expo development server.
- `make test` — run the complete Jest test suite.
- `make lint` — run Expo ESLint checks.
- `make typecheck` — run TypeScript checks.
- `make build` — export production bundles for all configured platforms.

## Coding Style & Naming Conventions

Adopt the standard formatter and linter for the selected language, commit their configuration, and run them before opening a pull request. Use spaces rather than tabs unless the formatter dictates otherwise. Prefer small modules with explicit interfaces.

Use descriptive domain names: `MealEntry`, `FoodItem`, and `recordMeal` are clearer than generic names such as `Data` or `handle`. Follow language conventions for filenames and identifiers consistently; name tests after the behavior they verify.

## Testing Guidelines

Every behavior change should include automated tests. Cover normal flows, validation failures, and boundary cases such as empty meals, invalid quantities, and date transitions. Tests must be deterministic: freeze time where needed and avoid shared mutable data. Keep fixtures minimal and free of personal or production information.

## Commit & Pull Request Guidelines

There is no Git history from which to infer an established convention. Use short, imperative commit subjects, optionally with a Conventional Commit prefix, such as `feat: add meal entry validation` or `fix: handle empty food names`.

Pull requests should explain the problem, summarize the solution, list verification performed, and link relevant issues. Include screenshots for user-interface changes and call out schema, configuration, or dependency changes explicitly.

## Security & Configuration

Never commit secrets, credentials, or real food-log data. Store local settings in ignored environment files and provide a sanitized `.env.example` when configuration is introduced.
