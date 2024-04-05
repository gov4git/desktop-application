# Code Base

## Project Structure

The source code for this project lives in the `src` directory. Most of the other files and folders in this project contain configurations and meta-data used by electron and other development tools.

This is an electron application and as such it is helpful to be familiar with [electron](https://www.electronjs.org/).

Electon essentially runs two processes, a webkit based process where UI code runs and a [Node.JS](https://nodejs.org/en) process where backend Node code runs. Electron also provides a layer to connect the two processes for Inter-process communication (IPC) that allows for communicating and passing data between the two processes.

### src/electron

This is where the backend Node.js code lives. Most of the code exists in the `src/electron/services` directory and services are registered in a service container within `src/electron/main.ts`.

`src/electron/main.ts` is the entrypoint for electron and as such starts up the frontend webkit process and establishes the bridge layer between the two processes. The startup code occurs in the `app.whenReady()` startup hook.

### src/electron/preload.ts

This file establishes the communication layer (the IPC layer) between the backend `src/electron` code and the frontend `src/renderer` UI code.

This file should not be modified. Instead of modifying this file when new communications are required, communications are tunneled through this layer using a service registry pattern. New services (JavaScript classes) are created and registered in the backend which are then exposed to the frontend. More on services below.

### src/renderer

This is where the frontend UI code runs within the webkit process and as such this code has access to all the standard webkit browser APIs. The frontend code is a [React](https://react.dev/) application.

`src/renderer/src/index.ts` is the entrypoint for the frontend code and launches the main app in `src/renderer/src/App/App.tsx`.

The frontend code does not have access to any Node.js APIs (such as file system access) and therefore needs to communicate with the backend through services for that functionality. `src/renderer/src/services` contains proxies to the backend services.

`src/renderer/src/store` contains React state management using [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) built around services.

### src/shared

Contains types for code, such as services, that are used in both the backend and frontend. Also contains reusable code that is used in both the backend and frontend.

> [!CAUTION]
> Reusable code that lives in `src/shared` cannot rely on Node.JS APIs since those are not available to frontend code.

## Services

Services are JavaScript classes that live in `src/electron/services` that are registered in a service container within `src/electron/main.ts`. Services are registered and run as singleton objects. Some services and methods are exposed to the frontend but not all of them. Some are private to the backend code.

### Adding a new service

#### Add the new service ID for registering the service

Add a new service ID to the `ServiceId` type in `src/shared/services/Service.ts`. This is a unique ID for registering and resolving the service from the service container in `src/electron/main.ts`

#### Create the service

Add the new service to `src/electron/services` and register the service in `src/electron/main.ts` using the newly created service ID.

#### Depending on other services

By passing the service container to the constructor of a service, that service may then utilize other registered services. View existing services for this pattern.

> [!Warning]
> Be careful not to create circular dependency requirements in the service layer. The order in which services are registered in `src/electron/main.ts` matters. Services need to be registered after the other services they depend on.

#### Exposing a service to the frontend

To expose a service to the frontend, create an abstract base class for the public methods of the service in `src/shared/services` directory and update the service itself to extend this base class. Then create a proxy for that service in `src/renderer/src/services`. The proxy can then be used within the frontend code (typically used in `src/renderer/src/store`) as if the service was directly embedded in the frontend. View the existing base classes and proxies for examples of this pattern.

### Updating an existing service

Updating an existing service is much the same as creating a new service. Keep in mind that the type signatures of the abstract base classes and the service itself need to match.

## GitRules protocol

This application uses the [@gov4git/js-client](https://www.npmjs.com/package/@gov4git/js-client) npm package for working with the GitRules protocol. All communication with the GitRules protocol is facilitated with the `src/electron/services/GitRules.ts` service.

## Caching

[SQLite](https://www.sqlite.org/index.html) is used to cache user information and data from the GitRules protocol.
