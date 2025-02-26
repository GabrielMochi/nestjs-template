# Core

The `core` directory contains the fundamental business logic of the application, independent of any framework or external dependencies. It follows Clean Architecture principles to ensure separation of concerns.

## Structure

- `domain/` – Defines the core business entities, aggregates, value objects, and domain events.
- `application/` – Contains use cases, services, and business logic that orchestrates the domain.

## Why?

By isolating the core logic, we ensure that our application remains maintainable, testable, and framework-agnostic.
