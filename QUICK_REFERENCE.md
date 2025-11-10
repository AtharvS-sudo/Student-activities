# 🚀 Quick Reference Card

## Custom Hooks Cheat Sheet

### Import Hooks
```javascript
import { 
  useNotices, 
  useForm, 
  useDepartments, 
  useAuth 
} from '../hooks';
```

### useNotices - Fetch & Manage Notices
```javascript
const { notices, loading, error, deleteNotice, pinNotice } = useNotices({ 
  type: 'academic',      // Optional
  department: 'id',      // Optional
  club: 'id'            // Optional
});
```

### useForm - Form State
```javascript
const { values, handleChange, resetForm } = useForm({
  email: '',
  password: ''
});
```

### useDepartments - Get Departments
```javascript
const { departments, loading } = useDepartments();
```

### useAuth - Authentication
```javascript
const { user, login, logout, isAuthenticated } = useAuth();
```

---

## CSS Modules Cheat Sheet

### Import Styles
```javascript
import styles from '../styles/MyComponent.module.css';
```

### Use Classes
```javascript
<div className={styles.container}>
  <h1 className={styles.title}>Hello</h1>
</div>
```

### Conditional Classes
```javascript
<div className={`${styles.card} ${active ? styles.active : ''}`}>
```

---

## Utility Functions Cheat Sheet

### Import Utils
```javascript
import { formatDate, formatFileSize, NOTICE_TYPES } from '../utils';
```

### Format Date
```javascript
formatDate(new Date())  // "Jan 15, 2024"
```

### Format File Size
```javascript
formatFileSize(1024000)  // "1 MB"
```

### Use Constants
```javascript
if (notice.type === NOTICE_TYPES.ACADEMIC) { }
```

---

## Common Patterns

### Pattern 1: Fetch & Display
```javascript
function MyComponent() {
  const { notices, loading } = useNotices();
  
  if (loading) return <p>Loading...</p>;
  
  return notices.map(n => <div key={n._id}>{n.title}</div>);
}
```

### Pattern 2: Form Handling
```javascript
function MyForm() {
  const { values, handleChange } = useForm({ name: '' });
  
  return (
    <input 
      name="name" 
      value={values.name} 
      onChange={handleChange} 
    />
  );
}
```

### Pattern 3: Delete with Confirmation
```javascript
const { deleteNotice } = useNotices();

const handleDelete = async (id) => {
  if (window.confirm('Delete?')) {
    const result = await deleteNotice(id);
    if (!result.success) alert(result.message);
  }
};
```

---

## File Locations

```
frontend/src/
├── hooks/              # Custom hooks
├── styles/             # CSS modules
├── utils/              # Utilities
├── components/         # UI components
└── pages/             # Page components
```

---

## Documentation

- **HOOKS_USAGE_GUIDE.md** - Detailed hook examples
- **ARCHITECTURE_OVERVIEW.md** - System architecture
- **REFACTORING_SUMMARY.md** - What was changed
- **IMPROVEMENT_RECOMMENDATIONS.md** - Future improvements

---

## Quick Commands

```bash
# Start development
npm start

# Run tests
npm test

# Build for production
npm run build
```

---

## Need Help?

1. Check HOOKS_USAGE_GUIDE.md
2. Review code examples in hooks/
3. Look at refactored components
4. Check inline comments

---

**Keep this card handy for quick reference!** 📌
