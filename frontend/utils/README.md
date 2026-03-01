# Utility Functions

This folder contains utility functions and helper methods used across the application.

## Purpose

Utilities are pure functions that perform specific tasks without side effects. They help keep code DRY (Don't Repeat Yourself) and maintainable.

## Adding Utilities

Create utility files organized by purpose:

### Example: formatters.ts
```typescript
// utils/formatters.ts

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}
```

### Example: validators.ts
```typescript
// utils/validators.ts

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
}

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}
```

### Example: helpers.ts
```typescript
// utils/helpers.ts

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
```

### Example: constants.ts
```typescript
// utils/constants.ts

export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
  STAFF: 'staff'
} as const;

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;
```

## Organization

Organize utilities by category:

```
utils/
├── formatters.ts      # Date, time, currency, number formatting
├── validators.ts      # Input validation functions
├── helpers.ts         # General helper functions
├── constants.ts       # Application constants
├── api-helpers.ts     # API-related utilities
└── storage.ts         # LocalStorage/SessionStorage helpers
```

## Best Practices

1. **Pure Functions** - No side effects, same input = same output
2. **Type Safety** - Use TypeScript types and generics
3. **Single Responsibility** - Each function does one thing
4. **Descriptive Names** - Clear, self-documenting names
5. **Export Named** - Use named exports, not default
6. **Test Coverage** - Write unit tests for complex utilities

## Usage Example

```typescript
// In a component
import { formatDate, isValidEmail } from '@/utils/formatters';
import { ROLES } from '@/utils/constants';

function MyComponent() {
  const formattedDate = formatDate(new Date());
  const isValid = isValidEmail('user@example.com');
  const isDoctor = user.role === ROLES.DOCTOR;
  
  return <div>{formattedDate}</div>;
}
```

## Common Utility Categories

- **Formatters** - Format dates, numbers, currencies, strings
- **Validators** - Validate emails, phones, passwords, forms
- **Parsers** - Parse URLs, query strings, JSON
- **Transformers** - Transform data structures, arrays, objects
- **Calculators** - Calculate ages, durations, percentages
- **Generators** - Generate IDs, slugs, random values
- **Storage** - LocalStorage/SessionStorage wrappers
- **Constants** - Shared constants and enums
