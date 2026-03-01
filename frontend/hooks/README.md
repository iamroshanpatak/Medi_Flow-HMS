# Custom React Hooks

This folder is for custom React hooks used across the application.

## Current Hooks

### useAuth (from AuthContext)
The main authentication hook is defined in `contexts/AuthContext.tsx`:
```typescript
const { user, login, logout, register, loading } = useAuth();
```

## Adding New Hooks

Create custom hooks here following React naming conventions:

### Example: useLocalStorage
```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

### Example: useDebounce
```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## Hook Naming Convention

- All hooks must start with `use` (React convention)
- Use descriptive names: `useWindowSize`, `useFetch`, `useForm`
- Export as named exports

## Best Practices

1. **Single Responsibility** - Each hook should do one thing well
2. **Type Safety** - Use TypeScript generics for reusable hooks
3. **Dependencies** - Properly list dependencies in useEffect
4. **Cleanup** - Return cleanup functions when needed
5. **Documentation** - Add JSDoc comments for complex hooks

## Common Use Cases

- **Data Fetching** - `useFetch`, `useQuery`
- **Form Handling** - `useForm`, `useFormValidation`
- **UI State** - `useToggle`, `useModal`, `useDropdown`
- **Browser APIs** - `useLocalStorage`, `useGeolocation`, `useMediaQuery`
- **Utilities** - `useDebounce`, `useThrottle`, `usePrevious`
