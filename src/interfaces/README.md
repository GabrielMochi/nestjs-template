# Interfaces (Presentation Layer)

The `interfaces` directory is responsible for handling all external communication with the application.  
It serves as the **entry point** for HTTP requests, WebSocket connections, and other external interactions.

## Structure

```sh
interfaces
├── http
│   ├── controllers  # Handles incoming requests and delegates to use cases
│   ├── filters      # Global and route-specific exception filters
│   ├── interceptors # Custom logic for request/response transformation
│   ├── guards       # Authentication and authorization guards
│   ├── middleware   # NestJS middleware for request handling
```

## Responsibilities

- **Controllers**: Define API endpoints and delegate business logic to application use cases.
- **Filters**: Handle global exception formatting and error handling.
- **Interceptors**: Modify requests/responses (e.g., logging, transformation).
- **Guards**: Implement authentication and authorization logic.
- **Middleware**: Process requests before reaching controllers (e.g., logging, security checks).

## Why This Layer?

Following **Clean Architecture**, controllers should be **thin** and only handle:

1. **Validating incoming requests** (using DTOs or decorators).
2. **Calling the appropriate use case** from the application layer.
3. **Returning formatted responses** to the client.

This keeps the **application layer** independent from frameworks like NestJS, making the system more modular and maintainable.
