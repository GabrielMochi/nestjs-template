# Domain

The `domain` directory represents the **core business rules** of the application. It is **pure** and free from any external dependencies.

## Structure

- **Entities** – Represent core business objects with attributes and behavior.
- **Value Objects** – Immutable objects that provide additional meaning.
- **Aggregates** – Group related entities to maintain consistency.
- **Domain Events** – Capture significant business events.

## Why?

This layer ensures that business rules remain independent from frameworks, databases, and other external systems.
