### Conflicting tsconfig paths extraction example

Several `tsconfig.json` with conflicting paths. <br>
Notice zero usage of relative paths. <br>
By default webpack does not support such use-case, but we can accomplish it by using this plugin!

---

Keep in mind - `tsconfig.json` can't extend `paths` compiler option.
That is, despite the fact that plugin *can* understand what you mean by using nested `paths`, we still have to duplicate them in every folder in order for TypeScript to work.

To test:
```
npx webpack
node dist/main
```
