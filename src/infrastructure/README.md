# Infrastructure

The `infrastructure` directory contains external-facing implementations such as database connections, API clients, and configuration files.

## Structure

- `config/` – Manages application configuration.
- `persistence/` – Handles database access and repositories.
- `adapters/` – Bridges external dependencies (e.g., APIs, message queues).

## Why?

This layer isolates external dependencies, making it easier to swap technologies without affecting the core application.
