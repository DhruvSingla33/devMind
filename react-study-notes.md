# React — Complete Study Notes

> Covers React 19. Each topic has: concept → why it matters → code → common pitfalls.

---

## Table of Contents
1. [What is React](#1-what-is-react)
2. [JSX](#2-jsx)
3. [Components](#3-components)
4. [Props](#4-props)
5. [State (`useState`)](#5-state-usestate)
6. [Rendering & Re-rendering](#6-rendering--re-rendering)
7. [Event Handling](#7-event-handling)
8. [Conditional Rendering](#8-conditional-rendering)
9. [Lists & Keys](#9-lists--keys)
10. [Forms (Controlled vs Uncontrolled)](#10-forms)
11. [`useEffect` & Side Effects](#11-useeffect--side-effects)
12. [`useRef`](#12-useref)
13. [Context API (`useContext`)](#13-context-api)
14. [`useReducer`](#14-usereducer)
15. [Performance: `memo`, `useMemo`, `useCallback`](#15-performance)
16. [Custom Hooks](#16-custom-hooks)
17. [Rules of Hooks](#17-rules-of-hooks)
18. [Component Lifecycle (Hooks view)](#18-component-lifecycle)
19. [Lifting State Up & Data Flow](#19-lifting-state-up)
20. [Composition & Children](#20-composition--children)
21. [Fragments, Portals, Refs forwarding](#21-fragments-portals-refs)
22. [Error Boundaries](#22-error-boundaries)
23. [Suspense & Lazy Loading](#23-suspense--lazy-loading)
24. [Concurrent Features: `useTransition`, `useDeferredValue`](#24-concurrent-features)
25. [React 19: Actions, `useActionState`, `useOptimistic`, `use`](#25-react-19-features)
26. [Server Components (RSC)](#26-server-components)
27. [Routing (React Router)](#27-routing)
28. [Data Fetching Patterns](#28-data-fetching)
29. [State Management (Redux Toolkit, Zustand)](#29-state-management)
30. [Styling Approaches](#30-styling)
31. [Testing](#31-testing)
32. [Virtual DOM & Reconciliation](#32-virtual-dom--reconciliation)
33. [Common Interview Questions](#33-interview-questions)

---

## 1. What is React

- A **JavaScript library for building user interfaces**, created by Meta (2013).
- **Declarative**: you describe *what* the UI should look like for a given state; React figures out *how* to update the DOM.
- **Component-based**: UI is split into reusable, self-contained pieces.
- **Learn once, write anywhere**: React DOM (web), React Native (mobile).
- **One-way data flow**: data flows parent → child via props.

**Core formula:** `UI = f(state)`

Setup (modern):
```bash
npm create vite@latest my-app -- --template react
# or a framework: npx create-next-app@latest
```

---

## 2. JSX

JSX = JavaScript XML. Syntax sugar compiled to `React.createElement` / `jsx()` calls.

```jsx
const el = <h1 className="title">Hello, {name}</h1>;
// compiles to roughly:
const el = jsx('h1', { className: 'title', children: ['Hello, ', name] });
```

**Rules**
- Return **one root element** (wrap in `<>...</>` if needed).
- Close all tags: `<img />`, `<br />`.
- Use `className` not `class`, `htmlFor` not `for`.
- Attributes are camelCase: `onClick`, `tabIndex`.
- `{}` embeds any JS **expression** (not statements — no `if`/`for` inside).
- `style` takes an object: `style={{ color: 'red', fontSize: 16 }}`.
- Comments: `{/* comment */}`.

**Pitfall:** `{count && <p>..</p>}` renders `0` when count is 0. Use `{count > 0 && ...}`.

---

## 3. Components

A component is a **function that returns JSX**. Name must start with a **capital letter**.

```jsx
function Welcome() {
  return <h1>Welcome!</h1>;
}

export default function App() {
  return <Welcome />;
}
```

**Class components** (legacy, still seen in old code):
```jsx
class Welcome extends React.Component {
  render() { return <h1>Hello {this.props.name}</h1>; }
}
```
Prefer function components + hooks.

**Pure components:** given the same props/state, a component should return the same JSX and have no side effects during render.

**Pitfall:** never define a component *inside* another component — it gets recreated each render and loses state.

---

## 4. Props

Props = inputs passed from parent to child. **Read-only.**

```jsx
function Avatar({ name, size = 40 }) {   // destructuring + default
  return <img alt={name} width={size} />;
}

<Avatar name="Dhruv" size={64} />
```

- Any value can be a prop: strings, numbers, objects, arrays, functions, JSX.
- Spread: `<Avatar {...user} />`.
- `children` is a special prop = the content between tags.

**Never mutate props.** If a child needs to change data, the parent passes a callback.

---

## 5. State (`useState`)

State = data that changes over time and **triggers a re-render** when updated.

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Key points**
- State updates are **asynchronous & batched** — the value doesn't change until next render.
- Use **functional updates** when new state depends on old:
  ```js
  setCount(c => c + 1);
  setCount(c => c + 1); // correctly +2
  ```
- **Immutability** — always create new objects/arrays:
  ```js
  setUser({ ...user, name: 'A' });
  setItems([...items, newItem]);
  setItems(items.filter(i => i.id !== id));
  setItems(items.map(i => i.id === id ? { ...i, done: true } : i));
  ```
- **Lazy initializer** for expensive initial value: `useState(() => heavyCompute())`.

**Pitfalls**
- `items.push(x); setItems(items)` → no re-render (same reference).
- Don't store derived values in state (e.g. `fullName` from `first`+`last`) — compute during render.

---

## 6. Rendering & Re-rendering

A component re-renders when:
1. Its **state** changes.
2. Its **parent** re-renders (props or not).
3. A **context** it consumes changes.

Render phases:
1. **Trigger** (state set)
2. **Render** (React calls your component — must be pure)
3. **Commit** (React applies DOM changes)

Re-render ≠ DOM update. React only touches the DOM where output differs.

**StrictMode** (dev only) double-invokes renders and effects to expose impure code.

---

## 7. Event Handling

```jsx
function Btn() {
  function handleClick(e) {
    e.preventDefault();
    console.log('clicked', e.target);
  }
  return <button onClick={handleClick}>Click</button>;
}
```

- Pass the function, **don't call it**: `onClick={handleClick}` ✅, `onClick={handleClick()}` ❌.
- With args: `onClick={() => remove(id)}`.
- React uses **SyntheticEvent** — cross-browser wrapper over native events.
- `e.stopPropagation()` stops bubbling.
- Naming convention: props `onSomething`, handlers `handleSomething`.

---

## 8. Conditional Rendering

```jsx
// if/else (outside JSX)
if (loading) return <Spinner />;

// ternary
{isLoggedIn ? <Dashboard /> : <Login />}

// logical AND
{error && <p className="err">{error}</p>}

// return null to render nothing
if (!visible) return null;
```

For many branches use an object map:
```jsx
const views = { home: <Home />, profile: <Profile /> };
return views[tab] ?? <NotFound />;
```

---

## 9. Lists & Keys

```jsx
<ul>
  {todos.map(todo => <li key={todo.id}>{todo.text}</li>)}
</ul>
```

**Keys** help React identify which items changed/added/removed.
- Must be **unique among siblings** and **stable**.
- Use DB ids. **Avoid array index** if list can reorder/insert/delete — causes wrong state association and bugs in inputs.
- Keys aren't passed as props.
- Changing a component's `key` **resets** it (useful trick to reset a form).

---

## 10. Forms

**Controlled** — React state is the source of truth:
```jsx
function Form() {
  const [email, setEmail] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); submit(email); }}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <button type="submit">Send</button>
    </form>
  );
}
```

**Uncontrolled** — DOM holds the value; read via ref or FormData:
```jsx
function Form() {
  function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    console.log(data.get('email'));
  }
  return <form onSubmit={handleSubmit}><input name="email" defaultValue="" /></form>;
}
```

- Checkbox: `checked` + `onChange`. Select: `value` on `<select>`.
- Multiple fields: one state object + `[e.target.name]: e.target.value`.
- Libraries: **React Hook Form**, **Formik**; validation with **Zod/Yup**.
- React 19: `<form action={fn}>` — see §25.

---

## 11. `useEffect` & Side Effects

Effects sync your component with **external systems** (network, DOM APIs, timers, subscriptions).

```jsx
useEffect(() => {
  // runs after commit
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);   // cleanup
}, [/* dependencies */]);
```

| Deps array | Runs |
|---|---|
| none | after every render |
| `[]` | once after mount (cleanup on unmount) |
| `[a, b]` | on mount + whenever `a` or `b` changes |

**Fetching with cleanup (avoid race conditions):**
```jsx
useEffect(() => {
  let ignore = false;
  fetch(`/api/user/${id}`).then(r => r.json()).then(d => { if (!ignore) setUser(d); });
  return () => { ignore = true; };
}, [id]);
```

**You might NOT need an effect** for:
- Transforming data for render → compute inline / `useMemo`.
- Responding to user events → do it in the event handler.
- Resetting state on prop change → use `key`.

**Pitfalls:** missing deps (stale values), objects/functions in deps causing infinite loops, setting state unconditionally in an effect.

Related: `useLayoutEffect` (runs synchronously before paint — for measuring DOM), `useInsertionEffect` (CSS-in-JS libs).

---

## 12. `useRef`

Holds a **mutable value that persists across renders without causing re-render**.

```jsx
// 1. DOM access
const inputRef = useRef(null);
<input ref={inputRef} />
inputRef.current.focus();

// 2. Store mutable values (timer ids, previous values)
const timer = useRef();
timer.current = setTimeout(...);
```

- Changing `ref.current` doesn't re-render.
- Don't read/write refs during render (except init).
- React 19: `ref` is a normal prop for function components — `forwardRef` no longer required.

---

## 13. Context API

Avoids **prop drilling** — share data with deep children.

```jsx
const ThemeContext = createContext('light');

function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext value={{ theme, setTheme }}>   {/* React 19; older: ThemeContext.Provider */}
      <Page />
    </ThemeContext>
  );
}

function Button() {
  const { theme } = useContext(ThemeContext);
  return <button className={theme}>OK</button>;
}
```

- Good for: theme, auth user, locale.
- Every consumer re-renders when the value changes → memoize value (`useMemo`) and split contexts for unrelated data.
- Not a full state manager for high-frequency updates.

---

## 14. `useReducer`

For complex state logic with many transitions.

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'add':    return [...state, action.item];
    case 'remove': return state.filter(i => i.id !== action.id);
    default: throw new Error('Unknown action');
  }
}

const [items, dispatch] = useReducer(reducer, []);
dispatch({ type: 'add', item: { id: 1, text: 'Learn' } });
```

- Reducer must be **pure**.
- `useState` vs `useReducer`: simple independent values → `useState`; related values / many update types → `useReducer`.
- `useReducer` + Context = lightweight Redux.

---

## 15. Performance

**`React.memo`** — skip re-render if props are shallow-equal:
```jsx
const Row = memo(function Row({ item }) { ... });
```

**`useMemo`** — cache an expensive computation:
```jsx
const sorted = useMemo(() => items.slice().sort(cmp), [items]);
```

**`useCallback`** — cache a function reference (useful when passing to memoized children):
```jsx
const handleSelect = useCallback(id => setSelected(id), []);
```

**React Compiler** (React 19 era) auto-memoizes, making most manual `memo/useMemo/useCallback` unnecessary.

Other techniques:
- Code splitting with `lazy`.
- **List virtualization** (react-window, FlashList) for long lists.
- Keep state as **local** as possible.
- Profile with **React DevTools Profiler** before optimizing.

---

## 16. Custom Hooks

Extract reusable stateful logic. Name must start with `use`.

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => !ignore && setData(d))
      .catch(e => !ignore && setError(e))
      .finally(() => !ignore && setLoading(false));
    return () => { ignore = true; };
  }, [url]);

  return { data, loading, error };
}

// usage
const { data, loading } = useFetch('/api/books');
```

Each call has its **own independent state** — hooks share logic, not state.

Other examples: `useLocalStorage`, `useDebounce`, `useWindowSize`, `useOnClickOutside`.

---

## 17. Rules of Hooks

1. Call hooks **only at the top level** — not in loops, conditions, nested functions.
2. Call hooks **only from React functions** (components or custom hooks).

Why: React tracks hooks by **call order**. Changing order between renders breaks state mapping.

Enforce with `eslint-plugin-react-hooks`.

(Exception: React 19's `use()` can be called conditionally.)

---

## 18. Component Lifecycle

| Class method | Hooks equivalent |
|---|---|
| `constructor` | `useState` initializer |
| `componentDidMount` | `useEffect(fn, [])` |
| `componentDidUpdate` | `useEffect(fn, [deps])` |
| `componentWillUnmount` | cleanup returned from `useEffect` |
| `shouldComponentUpdate` | `React.memo` |
| `getDerivedStateFromError` / `componentDidCatch` | Error boundary (class only) |

Phases: **Mount → Update(s) → Unmount**.

---

## 19. Lifting State Up

When two siblings need the same data, move state to their **closest common parent** and pass it down.

```jsx
function Parent() {
  const [value, setValue] = useState('');
  return (
    <>
      <Input value={value} onChange={setValue} />
      <Preview value={value} />
    </>
  );
}
```

**Single source of truth** — each piece of state lives in exactly one place.
Data down (props), events up (callbacks).

---

## 20. Composition & Children

Prefer **composition over inheritance**.

```jsx
function Card({ title, children, footer }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
      <footer>{footer}</footer>
    </div>
  );
}

<Card title="Hi" footer={<Button />}><p>Body</p></Card>
```

Patterns:
- **Slots** via props (`header`, `footer`).
- **Render props**: `<List renderItem={item => <Row {...item} />} />`.
- **Higher-Order Components (HOC)**: `withAuth(Component)` — older pattern, mostly replaced by hooks.
- **Compound components**: `<Tabs><Tabs.List/><Tabs.Panel/></Tabs>` sharing context.

---

## 21. Fragments, Portals, Refs

**Fragment** — group without extra DOM node:
```jsx
<>
  <td>A</td><td>B</td>
</>
<Fragment key={id}>...</Fragment>   // when key needed
```

**Portal** — render outside parent DOM hierarchy (modals, tooltips):
```jsx
createPortal(<Modal />, document.getElementById('modal-root'));
```
Events still bubble through the React tree.

**Forwarding refs**:
```jsx
// React 19
function MyInput({ ref, ...props }) { return <input ref={ref} {...props} />; }

// React ≤18
const MyInput = forwardRef((props, ref) => <input ref={ref} {...props} />);
```
`useImperativeHandle` exposes a custom API via ref.

---

## 22. Error Boundaries

Catch render errors in child tree and show fallback UI. **Must be a class component** (or use `react-error-boundary` library).

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { logError(error, info); }
  render() {
    return this.state.hasError ? <h2>Something went wrong.</h2> : this.props.children;
  }
}
```

Doesn't catch: event handler errors, async code, SSR, errors in the boundary itself.

---

## 23. Suspense & Lazy Loading

**Code splitting:**
```jsx
const Settings = lazy(() => import('./Settings'));

<Suspense fallback={<Spinner />}>
  <Settings />
</Suspense>
```

Suspense shows `fallback` while children are "suspended" — waiting on lazy code or data (with Suspense-enabled data sources like `use()`, React Query, Relay, Next.js).

Nest Suspense boundaries to control loading granularity.

---

## 24. Concurrent Features

React can **interrupt** rendering to keep the UI responsive.

**`useTransition`** — mark updates as non-urgent:
```jsx
const [isPending, startTransition] = useTransition();
function onTab(t) {
  startTransition(() => setTab(t));
}
```

**`useDeferredValue`** — defer a value for slow subtrees:
```jsx
const deferredQuery = useDeferredValue(query);
<SlowList query={deferredQuery} />
```

Urgent: typing, clicking. Non-urgent: filtering huge lists, rendering tabs.

---

## 25. React 19 Features

**Actions** — async functions in transitions; pending/error handled for you.

```jsx
async function updateName(prev, formData) {
  const err = await saveName(formData.get('name'));
  return err ?? null;
}

function NameForm() {
  const [error, submitAction, isPending] = useActionState(updateName, null);
  return (
    <form action={submitAction}>
      <input name="name" />
      <button disabled={isPending}>Save</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

**`useFormStatus`** — child reads parent form pending state:
```jsx
function SubmitBtn() { const { pending } = useFormStatus(); return <button disabled={pending}>Go</button>; }
```

**`useOptimistic`** — show result before server confirms:
```jsx
const [optimisticMsgs, addOptimistic] = useOptimistic(msgs, (s, m) => [...s, { ...m, sending: true }]);
```

**`use()`** — read a promise or context (can be conditional):
```jsx
const user = use(userPromise);   // suspends until resolved
const theme = use(ThemeContext);
```

Other: `ref` as prop, `<Context>` as provider, document metadata (`<title>` inside components), stylesheet/script precedence, better hydration errors.

---

## 26. Server Components

**React Server Components (RSC)** run on the server only (used in Next.js App Router).

- Can be `async` and fetch data directly (DB, files).
- Ship **zero JS** to the client.
- Cannot use state, effects, or browser APIs.
- Add `'use client'` at file top to make a **Client Component** (interactive).
- `'use server'` marks **Server Functions** callable from client (form actions).

```jsx
// Server Component
export default async function Books() {
  const books = await db.books.findMany();
  return <BookList books={books} />;
}
```

---

## 27. Routing

React itself has no router. Popular: **React Router**, **TanStack Router**, Next.js file routing.

```jsx
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

<BrowserRouter>
  <nav><Link to="/">Home</Link> <Link to="/book/1">Book</Link></nav>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/book/:id" element={<Book />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>

function Book() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <button onClick={() => navigate('/')}>Back {id}</button>;
}
```

Concepts: nested routes + `<Outlet />`, protected routes, loaders/actions (data routers), query params via `useSearchParams`.

(React Native uses **React Navigation** — stack, tabs, drawer.)

---

## 28. Data Fetching

Options from simple → robust:
1. `useEffect` + `fetch` (manual loading/error/race handling).
2. Custom hook (`useFetch`).
3. **TanStack Query (React Query)** / **SWR** — caching, refetch, retries, pagination, mutations:
   ```jsx
   const { data, isLoading, error } = useQuery({
     queryKey: ['books', id],
     queryFn: () => api.get(`/books/${id}`).then(r => r.data),
   });
   ```
4. Framework loaders / Server Components.

Always handle: **loading** (spinner/skeleton/shimmer), **error**, **empty** states.

---

## 29. State Management

| Kind | Tool |
|---|---|
| Local UI state | `useState`, `useReducer` |
| Shared app state | Context, **Zustand**, **Redux Toolkit**, Jotai |
| Server state (cache) | TanStack Query, SWR, RTK Query |
| URL state | router search params |
| Form state | React Hook Form |

**Redux Toolkit:**
```js
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: { increment: s => { s.value += 1; } }, // Immer allows "mutation"
});
const store = configureStore({ reducer: { counter: counterSlice.reducer } });
// component
const value = useSelector(s => s.counter.value);
const dispatch = useDispatch();
dispatch(counterSlice.actions.increment());
```

**Zustand:**
```js
const useStore = create(set => ({ count: 0, inc: () => set(s => ({ count: s.count + 1 })) }));
const count = useStore(s => s.count);
```

---

## 30. Styling

- **Plain CSS / CSS Modules** (`styles.module.css` → scoped class names).
- **Tailwind CSS** — utility classes.
- **CSS-in-JS** — styled-components, Emotion.
- **Inline styles** — `style={{}}`.
- **Component libraries** — MUI, Chakra, shadcn/ui, Ant Design.
- React Native: `StyleSheet.create`.

---

## 31. Testing

- **Vitest / Jest** — test runner.
- **React Testing Library** — test like a user (query by role/text, not internals).
- **Playwright / Cypress** — end-to-end.
- **MSW** — mock network.

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('increments', async () => {
  render(<Counter />);
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('button')).toHaveTextContent('1');
});
```

---

## 32. Virtual DOM & Reconciliation

- **Virtual DOM**: lightweight JS object tree describing the UI.
- On update, React builds a new tree and **diffs** it against the previous one (**reconciliation**), then applies minimal real DOM changes.
- **Fiber** (React 16+): reimplementation that splits work into units → enables pausing, prioritizing, concurrent rendering.

Diffing heuristics (O(n)):
1. Different element **type** → tear down and rebuild subtree.
2. Same type → update changed attributes, recurse children.
3. **Keys** match children across renders.

---

## 33. Interview Questions

1. **State vs props?** Props are external & read-only; state is internal & mutable via setter.
2. **Why keys?** Identify list items for efficient, correct reconciliation.
3. **Why not mutate state?** React compares by reference; mutation skips re-render and breaks predictability.
4. **Controlled vs uncontrolled?** React state vs DOM owns input value.
5. **useEffect vs useLayoutEffect?** After paint vs before paint (sync).
6. **useMemo vs useCallback?** Memoizes a value vs a function.
7. **What causes re-render?** State change, parent re-render, context change.
8. **Prop drilling solutions?** Context, composition, state libraries.
9. **What is reconciliation?** Diffing virtual trees to compute minimal DOM updates.
10. **What is hydration?** Attaching event handlers/state to server-rendered HTML on the client.
11. **Why can't hooks be in conditions?** Hooks rely on call order.
12. **Server vs Client Components?** Server: no JS shipped, async data access, no interactivity. Client: state/effects/events.
13. **What is StrictMode?** Dev tool that double-invokes to surface side-effect bugs.
14. **How to optimize a slow list?** Virtualize, memoize rows, stable keys, avoid inline heavy work.
15. **What is a pure component?** Same input → same output, no side effects during render.

---

### Quick Hook Cheat Sheet

| Hook | Purpose |
|---|---|
| `useState` | local state |
| `useReducer` | complex state transitions |
| `useEffect` | side effects after render |
| `useLayoutEffect` | sync DOM measurement before paint |
| `useRef` | mutable value / DOM ref |
| `useContext` | read context |
| `useMemo` | cache computed value |
| `useCallback` | cache function |
| `useTransition` | non-urgent updates |
| `useDeferredValue` | defer a value |
| `useId` | stable unique ids (a11y) |
| `useImperativeHandle` | custom ref API |
| `useSyncExternalStore` | subscribe to external stores |
| `useActionState` | form action state (19) |
| `useFormStatus` | parent form pending (19) |
| `useOptimistic` | optimistic UI (19) |
| `use` | read promise/context (19) |
