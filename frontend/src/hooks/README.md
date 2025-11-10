# Custom Hooks

This folder contains all custom React hooks for the Student Activities Notice Board application.

## 📚 Available Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useNotices` | Fetch and manage notices | `{ notices, loading, error, refetch, deleteNotice, pinNotice }` |
| `useNoticeDetail` | Fetch single notice | `{ notice, loading, error, deleteNotice }` |
| `useForm` | Form state management | `{ values, errors, touched, handleChange, handleBlur, setFieldValue, setFieldError, resetForm }` |
| `useDepartments` | Fetch departments | `{ departments, loading, error }` |
| `useClubs` | Fetch clubs | `{ clubs, loading, error }` |
| `useUsers` | User management (admin) | `{ users, loading, error, refetch, updateUserPrivileges, updateUserRole }` |
| `useDebounce` | Debounce values | `debouncedValue` |
| `useAuth` | Authentication (from context) | `{ user, loading, login, register, logout, isAuthenticated }` |

## 🚀 Quick Start

```javascript
import { useNotices, useForm, useDepartments } from '../hooks';

function MyComponent() {
  const { notices, loading } = useNotices({ type: 'academic' });
  const { values, handleChange } = useForm({ title: '' });
  const { departments } = useDepartments();
  
  // Use the data...
}
```

## 📖 Documentation

For detailed usage examples and patterns, see:
- [HOOKS_USAGE_GUIDE.md](../../HOOKS_USAGE_GUIDE.md) - Complete usage guide
- [ARCHITECTURE_OVERVIEW.md](../../ARCHITECTURE_OVERVIEW.md) - Architecture details

## 🎯 Design Principles

1. **Single Responsibility**: Each hook does one thing well
2. **Consistent API**: All hooks return similar structures
3. **Error Handling**: Always return error states
4. **Loading States**: Always return loading states
5. **Memoization**: Use useCallback for performance

## 🧪 Testing

Hooks can be tested independently using `@testing-library/react-hooks`:

```javascript
import { renderHook } from '@testing-library/react-hooks';
import { useNotices } from './useNotices';

test('fetches notices', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useNotices());
  await waitForNextUpdate();
  expect(result.current.notices).toBeDefined();
});
```

## 🔧 Adding New Hooks

When creating a new hook:

1. Create file in this folder: `useMyFeature.js`
2. Export from `index.js`
3. Follow the existing patterns
4. Document in HOOKS_USAGE_GUIDE.md
5. Add tests

Example template:

```javascript
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useMyFeature = (params) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/endpoint', { params });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error message');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
```

## 📝 Notes

- All hooks use the API service from `../services/api.js`
- Error handling is consistent across all hooks
- Loading states are always provided
- Hooks are memoized with useCallback where appropriate
