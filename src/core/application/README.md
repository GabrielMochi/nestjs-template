# Application

The `application` directory contains **use cases** and **services** that implement business logic by interacting with the domain.

## Structure

- **Use Cases** – Define the workflows of the application (e.g., "CreateUser", "ProcessOrder").
- **Ports** – Define interfaces (Input/Output) to interact with infrastructure layers.
- **Services** – Implement domain logic while keeping dependencies minimal.

## Why?

This layer orchestrates business logic while remaining **decoupled** from external frameworks and infrastructure.
