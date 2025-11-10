# Custom Hooks Usage Guide

Quick reference for using the custom hooks in your Student Activities Notice Board project.

---

## 📚 Available Hooks

### 1. useNotices
**Purpose**: Fetch and manage notices with filtering, deletion, and pinning

```javascript
import { useNotices } from '../hooks';

function MyComponent() {
  const { 
    notices,      // Array of notice objects
    loading,      // Boolean loading state
    error,        // Error message (if any)
    refetch,      // Function to manually refetch
    deleteNotice, // Function to delete a notice
    pinNotice     // Function to pin/unpin a notice
  } = useNotices({ 
    type: 'academic',        // Optional: 'academic' or 'club'
    department: 'dept-id',   // Optional: department ID
    club: 'club-id'          // Optional: club ID
  });

  // Delete a notice
  const handleDelete = async (id) => {
    const result = await deleteNotice(id);
    if (result.success) {
      console.log('Deleted!');
    } else {
      alert(result.message);
    }
  };

  // Pin/unpin a notice (admin only)
  const handlePin = async (id) => {
    const result = await pinNotice(id);
    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {notices.map(notice => (
        <div key={notice._id}>{notice.title}</div>
      ))}
    </div>
  );
}
```

---

### 2. useNoticeDetail
**Purpose**: Fetch a single notice by ID

```javascript
import { useNoticeDetail } from '../hooks';
import { useParams, useNavigate } from 'react-router-dom';

function NoticeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    notice,       // Notice object
    loading,      // Boolean loading state
    error,        // Error message (if any)
    deleteNotice  // Function to delete the notice
  } = useNoticeDetail(id);

  const handleDelete = async () => {
    if (window.confirm('Delete this notice?')) {
      const result = await deleteNotice();
      if (result.success) {
        navigate('/dashboard');
      } else {
        alert(result.message);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!notice) return <p>Notice not found</p>;

  return (
    <div>
      <h1>{notice.title}</h1>
      <p>{notice.content}</p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

---

### 3. useForm
**Purpose**: Manage form state, validation, and errors

```javascript
import { useForm } from '../hooks';

function MyForm() {
  const { 
    values,        // Object with all form values
    errors,        // Object with field errors
    touched,       // Object tracking touched fields
    handleChange,  // Function for input onChange
    handleBlur,    // Function for input onBlur
    setFieldValue, // Set a specific field value
    setFieldError, // Set a specific field error
    setErrors,     // Set multiple errors
    resetForm      // Reset form to initial state
  } = useForm({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!values.email) {
      setFieldError('email', 'Email is required');
      return;
    }

    // Submit form
    console.log('Form values:', values);
    
    // Reset after success
    resetForm();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched.email && errors.email && (
        <span>{errors.email}</span>
      )}

      <input
        name="password"
        value={values.password}
        onChange={handleChange}
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

### 4. useDepartments
**Purpose**: Fetch list of departments

```javascript
import { useDepartments } from '../hooks';

function DepartmentSelector() {
  const { 
    departments,  // Array of department objects
    loading,      // Boolean loading state
    error         // Error message (if any)
  } = useDepartments();

  if (loading) return <p>Loading departments...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <select>
      <option value="">Select Department</option>
      {departments.map(dept => (
        <option key={dept._id} value={dept._id}>
          {dept.name} ({dept.code})
        </option>
      ))}
    </select>
  );
}
```

---

### 5. useClubs
**Purpose**: Fetch list of clubs

```javascript
import { useClubs } from '../hooks';

function ClubSelector() {
  const { 
    clubs,    // Array of club objects
    loading,  // Boolean loading state
    error     // Error message (if any)
  } = useClubs();

  if (loading) return <p>Loading clubs...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <select>
      <option value="">Select Club</option>
      {clubs.map(club => (
        <option key={club._id} value={club._id}>
          {club.name} - {club.category}
        </option>
      ))}
    </select>
  );
}
```

---

### 6. useUsers (Admin Only)
**Purpose**: Manage users (admin functionality)

```javascript
import { useUsers } from '../hooks';

function UserManagement() {
  const { 
    users,                  // Array of user objects
    loading,                // Boolean loading state
    error,                  // Error message (if any)
    refetch,                // Function to manually refetch
    updateUserPrivileges,   // Update user posting privileges
    updateUserRole          // Update user role
  } = useUsers();

  const togglePosting = async (userId, currentStatus) => {
    const result = await updateUserPrivileges(userId, !currentStatus);
    if (!result.success) {
      alert(result.message);
    }
  };

  const changeRole = async (userId, newRole) => {
    const result = await updateUserRole(userId, newRole);
    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Can Post</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user._id}>
            <td>{user.name}</td>
            <td>
              <select 
                value={user.role}
                onChange={(e) => changeRole(user._id, e.target.value)}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td>
              <input
                type="checkbox"
                checked={user.canPost}
                onChange={() => togglePosting(user._id, user.canPost)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

### 7. useDebounce
**Purpose**: Debounce values (useful for search inputs)

```javascript
import { useState } from 'react';
import { useDebounce, useNotices } from '../hooks';

function SearchNotices() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500); // 500ms delay

  // This will only trigger API call 500ms after user stops typing
  const { notices, loading } = useNotices({ 
    search: debouncedSearch 
  });

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search notices..."
      />
      {loading && <p>Searching...</p>}
      {notices.map(notice => (
        <div key={notice._id}>{notice.title}</div>
      ))}
    </div>
  );
}
```

---

### 8. useAuth (Already Exists)
**Purpose**: Authentication and user context

```javascript
import { useAuth } from '../hooks';

function MyComponent() {
  const { 
    user,            // Current user object
    loading,         // Boolean loading state
    login,           // Login function
    register,        // Register function
    logout,          // Logout function
    isAuthenticated  // Boolean auth status
  } = useAuth();

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      console.log('Logged in!');
    } else {
      alert(result.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

---

## 🎨 CSS Modules Usage

### Basic Usage

```javascript
import styles from '../styles/MyComponent.module.css';

function MyComponent() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hello</h1>
      <button className={styles.button}>Click</button>
    </div>
  );
}
```

### Conditional Classes

```javascript
import styles from '../styles/MyComponent.module.css';

function MyComponent({ isActive }) {
  return (
    <div className={`${styles.card} ${isActive ? styles.active : ''}`}>
      Content
    </div>
  );
}
```

### Combining with Global Classes

```javascript
import styles from '../styles/MyComponent.module.css';

function MyComponent() {
  return (
    <div className={`${styles.container} container`}>
      {/* Uses both module and global class */}
      <button className={`${styles.button} btn btn-primary`}>
        Click
      </button>
    </div>
  );
}
```

---

## 🛠️ Utility Functions

### Formatters

```javascript
import { formatDate, formatDateTime, formatFileSize, truncateText } from '../utils';

// Format date
const date = formatDate(new Date());
// Output: "Jan 15, 2024"

// Format date with time
const dateTime = formatDateTime(new Date());
// Output: "January 15, 2024, 10:30 AM"

// Format file size
const size = formatFileSize(1024000);
// Output: "1 MB"

// Truncate text
const text = truncateText("This is a very long text...", 20);
// Output: "This is a very long..."
```

### Constants

```javascript
import { 
  USER_ROLES, 
  NOTICE_TYPES, 
  FILE_UPLOAD,
  STORAGE_KEYS 
} from '../utils';

// Use constants instead of strings
if (user.role === USER_ROLES.ADMIN) {
  // Admin logic
}

// File validation
if (file.size > FILE_UPLOAD.MAX_SIZE) {
  alert('File too large!');
}

// Notice type
const noticeType = NOTICE_TYPES.ACADEMIC;
```

---

## 🎯 Common Patterns

### Pattern 1: List with Filters

```javascript
import { useNotices, useDepartments } from '../hooks';

function FilteredNoticeList() {
  const [selectedDept, setSelectedDept] = useState('');
  const { departments } = useDepartments();
  const { notices, loading } = useNotices({ 
    department: selectedDept 
  });

  return (
    <div>
      <select onChange={(e) => setSelectedDept(e.target.value)}>
        <option value="">All Departments</option>
        {departments.map(dept => (
          <option key={dept._id} value={dept._id}>
            {dept.name}
          </option>
        ))}
      </select>

      {loading ? (
        <p>Loading...</p>
      ) : (
        notices.map(notice => (
          <div key={notice._id}>{notice.title}</div>
        ))
      )}
    </div>
  );
}
```

### Pattern 2: Form with Validation

```javascript
import { useForm } from '../hooks';
import api from '../services/api';

function CreateNoticeForm() {
  const { values, errors, handleChange, setFieldError, resetForm } = useForm({
    title: '',
    content: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!values.title) {
      setFieldError('title', 'Title is required');
      return;
    }

    try {
      await api.post('/notices', values);
      alert('Notice created!');
      resetForm();
    } catch (error) {
      alert('Failed to create notice');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        value={values.title}
        onChange={handleChange}
      />
      {errors.title && <span>{errors.title}</span>}

      <textarea
        name="content"
        value={values.content}
        onChange={handleChange}
      />

      <button type="submit">Create</button>
    </form>
  );
}
```

### Pattern 3: Protected Admin Action

```javascript
import { useAuth, useNotices } from '../hooks';

function NoticeCard({ notice }) {
  const { user } = useAuth();
  const { pinNotice } = useNotices();

  const handlePin = async () => {
    if (user.role !== 'admin') {
      alert('Admin only!');
      return;
    }

    const result = await pinNotice(notice._id);
    if (result.success) {
      alert('Notice pinned!');
    }
  };

  return (
    <div>
      <h3>{notice.title}</h3>
      {user.role === 'admin' && (
        <button onClick={handlePin}>
          {notice.isPinned ? 'Unpin' : 'Pin'}
        </button>
      )}
    </div>
  );
}
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't: Call hooks conditionally
```javascript
// WRONG
if (someCondition) {
  const { notices } = useNotices();
}
```

### ✅ Do: Use hooks at top level
```javascript
// CORRECT
const { notices } = useNotices();

if (someCondition) {
  // Use notices here
}
```

### ❌ Don't: Forget to handle loading states
```javascript
// WRONG
const { notices } = useNotices();
return notices.map(n => <div>{n.title}</div>);
```

### ✅ Do: Always check loading
```javascript
// CORRECT
const { notices, loading } = useNotices();
if (loading) return <p>Loading...</p>;
return notices.map(n => <div>{n.title}</div>);
```

### ❌ Don't: Ignore error handling
```javascript
// WRONG
const result = await deleteNotice(id);
// Assume it worked
```

### ✅ Do: Check result status
```javascript
// CORRECT
const result = await deleteNotice(id);
if (result.success) {
  // Success logic
} else {
  alert(result.message);
}
```

---

## 📖 Additional Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

Happy coding! 🚀
