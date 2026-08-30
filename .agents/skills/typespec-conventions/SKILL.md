---
name: typespec-conventions
description: Conventions about working with TypeSpec openapi specifications
---


# Working with TypeSpec / OpenAPI generation

- Entry point is `main.tsp` (see `tspconfig.yaml`); only `@typespec/http` is imported/used (`using Http`) — `@typespec/rest` and `@typespec/openapi` are installed but not used directly, so don't add `import "@typespec/rest"` unless the design actually needs REST-specific decorators.
- Emitter is `@typespec/openapi3`, configured for OpenAPI **3.1.0**, output at `tsp-output/schema/openapi.yaml` (gitignored — always regenerate, never hand-edit or commit it).
- Conventions used in this spec, keep following them when extending:
  - One shared `@error model Error { code: int32; message: string; }`; every operation returns `SomeModel | Error`.
  - List responses are wrapped: `model FooList { items: Foo[] }`, returned by `list()`.
  - CRUD interfaces follow the same shape: `@route("/foos") @tag("Foos") interface Foos { @get list(); @get read(@path id); @post create(@body body: Foo); @patch update(@path id, @body body: MergePatchUpdate<Foo>); @delete delete(@path id); }`.
  - Custom actions are nested sub-routes on the resource, e.g. `@route("{id}/book") @post book(@path id: string): Slot | Error;`.
  - Business rules that TypeSpec can't express as schema constraints (booking window, no double-booking) are documented with `/** ... */` doc comments on the `@service` namespace and on the relevant operation, not enforced by the type system.
- After editing `.tsp` files, always run `npx tsp compile .` and confirm it prints "Compilation completed successfully." before considering the change done — TypeSpec errors are easy to introduce (e.g. missing `@path`/`@query`/`@body`, wrong casing, unresolved model refs).
