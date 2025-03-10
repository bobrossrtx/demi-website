---
title: Error Handling
description: Understanding error handling and debugging in Demi
page: basics/error-handling
tags: ["error handling", "debugging", "basics", "demi", "programming", "guide"]
order: 6
catid: 1
---

Error handling in Demi provides developers with tools to identify, handle, and debug issues in their code. Understanding these mechanisms is crucial for writing reliable and maintainable programs.

---

### 1. Types of Errors
Demi includes several built-in error types to help identify different kinds of issues:

1. Syntax Errors - Code structure and parsing issues
2. Runtime Errors - Errors that occur during program execution
3. Assertion Errors - Failed program assertions
4. Type Errors - Invalid type operations
5. Reference Errors - Invalid variable or function references
6. Custom Errors - User-defined error types

---

### 2. Assertions
#### Basic Assertion Syntax
Assertions help verify that certain conditions are met during program execution.

```demi
assert(condition, "error message");
```

**Example**
```demi
let numbers = [1, 2, 3];
assert(numbers.length() > 0, "Array must not be empty");
# Output: Assert passed
```

---

### 3. Error Messages
Demi provides clear, formatted error messages to help diagnose issues:

- Red colored terminal output for errors
- Contextual error descriptions
- Line number references
- Specific error categories

**Example Output**
```demi
let x = 1;
x();  # Attempting to call a number as a function
# Output: Runtime Error: Attempt to call non-function value
```

---

### 4. Best Practices
1. Use assertions to validate important conditions
2. Include descriptive error messages
3. Check for potential runtime errors
4. Handle errors at appropriate levels
5. Document error handling strategies

---

### 5. Future Features
The following error handling features are planned for future releases:

- Try/catch blocks for structured error handling
- Stack trace information
- Enhanced error messages with code snippets
- Documentation links in error messages

---

### 6. Summary
- Demi provides 6 different error types
- Built-in assertion system for runtime validation
- Colored and formatted error output
- Line number tracking for easy debugging
- Future enhancements planned for more robust error handling

---

### To Be Updated