# Custom types

`AtLeastOne`

Can be used when you want to make at least one key of an object required.
You don't have to specify which key should be required, it will be inferred from the input type.
Useful for example when you have a function that requires at least one of the parameters, but not necessarily all of them.

```typescript
type TestType = {
    a: string;
    b: number;
}

const foo = (params: AtLeastOne<TestType>) => {
    // ...
}

// Valid
foo({ a: 'a' });
foo({ b: 1 });
foo({ a: 'a', b: 1 });

// Invalid
foo({});
```

`MayOmit`

Makes K keys optional in T.
Can be used to provide some defaults and merge input on top of it.
Requires you to explicitly specify which keys should be optional.

```typescript
type TestType = {
    a: string;
    b: number;
}

type TestTypeWithOptionalB = MayOmit<TestType, 'b'>;
```
