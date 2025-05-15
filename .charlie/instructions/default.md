# MOST IMPORTANT
- BEFORE you start work, update the Linear ticket (use your Linear CLI) as "In Progress".
- AFTER you are done with your work, update the Linear ticket as "In Review".
- Open PRs with draft=false.

# Coding Instructions

This documentation is intended to provide comprehensive guidelines for contributing to the codebase.
It outlines the tools, environment, coding standards, and best practices that ensure our code
remains clean, maintainable, and efficient.

## General

- Write elegant, concise, and readable code
- Prefer `const` over `let` (never use `var`)
- Use clear, descriptive names for variables, functions, and components

## Modules

## TypeScript

- NEVER use `any`/`unknown` or cast values like `(value as any)` or `value!` in TypeScript outside of test files e.g. `*.test.ts` or test fixtures e.g. `**/test-data.ts`.
  - Exception: It's ok to use `any` in generic types like `interface Tool<T extends z.ZodTypeAny = any>`
  - Exception: It is also acceptable to use `Record<string, unknown>` **only** for fields intended to carry arbitrary debugging metadata (commonly named `debug`, `debugInfo`, or similar). These objects exist solely for troubleshooting—such as rendering a raw JSON dump in the UI or emitting the data directly to logs—and are therefore exempt from the general prohibition on `unknown`. All other production-code usage of `unknown` remains disallowed.
- NEVER use TypeScript enums. Instead, use unions of literal types which avoid the runtime issues associated with enums.
- Don't rely on `typeof`, `ReturnType<>`, `Awaited<>`, etc for complex type inference (it's ok for simple types)
- Use `as const` for better type inference
- Use type guards to narrow types in conditional blocks
- Create custom types for complex data structures used throughout the application
- Utilize TypeScript's utility types (e.g., `Partial`, `Pick`, `Omit`) to manipulate existing types
- Never use `React.FC`. Use a function declaration instead
- Functions should accept an object parameter (like `args` or `props`) instead of multiple parameters
  - Good examples:
    ```ts
    function myFunction(args: { foo: boolean; bar: string }) {}
    function VideoPlayer(props: { sid: string }) {}
    ```
  - Bad examples:
    ```ts
    function myFunction(foo: boolean, bar: string, baz: number) {}
    ```
- Arguments should be destructured in the function body, not the function definition. It's ok for React components to destructure props in the function definition.
  - Good example:
    ```ts
    function myFunction(args: { foo: boolean; bar: string }) {
      const { foo, bar } = args;
    }
    ```
  - Bad example:
    ```ts
    function myFunction({ foo, bar }: { foo: boolean; bar: string });
    ```
- Zod should be used to parse untrusted data, but not for data that is trusted like function arguments
- Zod unions should always be used instead of enums
  - For example, this union `z.union([z.literal('foo'), z.literal('bar')])` is better than this enum `z.enum(['foo', 'bar'])`
- Promises (and `async` functions which implicitly create Promises) must always be properly handled, either via:
  - Using `await` to wait for the Promise to resolve successfully
  - Using `.then` or `.catch` to handle Promise resolution
  - Returning a Promise to a calling function which itself has to handle the Promise. If you can't infer this from the available context, add a warning that the promise may not be handled properly.
- Use `Promise.all()` for multiple independent async operations instead of sequential execution. For example, rather than `const foo = await getFoo(); const bar = await getBar();` (sequential), use `const [foo, bar] = await Promise.all([getFoo(), getBar()]);` (parallel) for better performance.

## Bun

Server-side code is written using Bun. Use native Bun (and the Node APIs it supports) when possible.

- Use standard lib modules like `Bun.file`, `$` shell commands, `Glob`, etc
- Prefer standard lib modules over third-party alternatives
- Utilize the `node:` protocol when importing Node.js modules (e.g., `import fs from 'node:fs/promises'`)
- Prefer the promise-based APIs over Node's legacy sync methods
- Use `Error` objects for operational errors, and consider extending `BaseError` for specific error types
- Use environment variables for configuration and secrets (avoid hardcoding sensitive information)

### Web Standard APIs

Always prefer using standard web APIs like `fetch`, `WebSocket`, and `ReadableStream` when possible. Avoid Node.js-specific modules (like `Buffer`) or redundant libraries (like `node-fetch`).

- Prefer the `fetch` API for making HTTP requests instead of Node.js modules like `http` or `https`
  - Use the native `fetch` API instead of `node-fetch` or polyfilled `cross-fetch`
  - Use the `ky` library for HTTP requests instead of `axios` or `superagent`
- Use the WHATWG `URL` and `URLSearchParams` classes instead of the Node.js `url` module
- Use `Request` and `Response` objects from the Fetch API instead of Node.js-specific request and response objects
- Utilize `Blob` and `File` APIs for handling binary data when possible
- Use `TextEncoder` and `TextDecoder` for encoding and decoding text

## Error Handling

- Prefer `async`/`await` over `.then()` and `.catch()`
- Always handle errors correctly (eg: `try`/`catch` or `.catch()`)
- Implement React Error Boundaries to catch and handle errors in component trees
- Avoid swallowing errors silently; always log or handle caught errors appropriately
- Express apis that have an error handler defined in app.ts will catch all errors thrown downstream. It is not necessary to trap or log errors anywhere but the global error handler in app.ts unless we need to capture specific details. An absence of a trap or log outside of the global error handler in app.ts is not a problem.

## Comments

Comments should be used to document and explain code. They should complement the use of descriptive variable and function names and type declarations.

- **ALWAYS** ensure comments are kept up to date as the code changes
- Add comments to explain complex sections of code
- Add comments that will improve the autocompletion preview in IDEs (eg: functions and types)
- Don't add comments that just reword symbol names or repeat type declarations

### Comment Format

- Use **JSDoc** formatting for comments (not TSDoc or inline comments)
- Common JSDoc tags to use:
  - `@param`: define a parameter on a function (should include the name, type, and description)
  - `@returns`: define the return type of a function
  - `@throws`: define an exception that can be thrown by a function
  - `@example`: provide an example of how to use a function or class
  - `@deprecated`: mark a function or class as deprecated
  - `@see`: define an external reference related to the symbol
  - `{@link}`: create a link to the namepath or URL
  - `@TODO`: mark a task that needs to be completed
- **DO NOT** use the following tags: `@file`, `@async`

This is an example of a JSDoc comment that follows the above guidelines:

```ts
/**
  * Updates the most recently posted message.
  *
  * @param {string} message - New content for the message
  * @param [boolean] createIfMissing - Create a new message if no messages have been posted yet
  * @returns {Promise<M>} The updated message
  * @throws {Error} If the message update operation fails
  */
updateLastMessage(message: string, createIfMissing?: boolean): Promise<M>;
```

## Readme Files

- All readme files **must be kept up to date**.
  - When the contents of a package that are referenced in the readme are updated, the readme must be updated as well.
- There must be a `readme.md` file in the root of the repo.
  - The root readme should focus on high level information and development guidelines.
- Every package should have a `readme.md` file in the root of the package.
  - Package readmes should focus on the package's purpose and usage.
  - Example sections for package readmes: table of contents, overview, key features, project structure, usage examples, testing, integration & dependencies, additional notes.
- Readme files should use GitHub Flavored Markdown (GFM) for formatting.
