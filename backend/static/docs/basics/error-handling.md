---
title: Error Handling
description: Understanding error handling in Demi including try-catch blocks and error types
page: basics/error-handling
tags: ["error handling", "basics", "demi", "programming", "guide", "try catch", "exceptions", "errors"]
order: 6
catid: 1
---

Error handling in Demi allows you to gracefully manage unexpected situations in your code. This guide will walk you through the basics of handling errors and exceptions in Demi.

---

### 1. Types of Errors
Demi has several types of errors that can occur during program execution:

#### 1.1 Syntax Errors
These occur when the code violates the language's syntax rules and are detected during parsing.

**Example**
```demi
# Missing closing parenthesis
print("Hello, World!";  # Syntax Error
```

#### 1.2 Runtime Errors
These occur during program execution when something unexpected happens.

**Example**
```demi
# Trying to access a property of undefined
let obj = undefined;
print(obj.property);  # Runtime Error: Cannot read property of undefined
```

#### 1.3 Logical Errors
These occur when the code runs without throwing errors but produces incorrect results due to flawed logic.

**Example**
```demi
# Function intended to add numbers but concatenates strings
function add(a, b) {
    return a + b;  # Works for numbers but concatenates strings
}

print(add("2", "3"));  # Output: "23" (not 5)
```

---

### 2. Try-Catch Blocks
#### Basic Syntax
```demi
try {
    # Code that might throw an error
} catch (error) {
    # Code to handle the error
} finally {
    # Code that always runs, regardless of errors
}
```

**Example**
```demi
try {
    let result = riskyOperation();
    print("Operation succeeded");
} catch (error) {
    print(`Error occurred: ${error.message}`);
} finally {
    print("Cleanup operations");
}
```

---

### 3. Throwing Custom Errors
You can throw your own errors using the `throw` statement:

```demi
function divide(a, b) {
    if (b === 0) {
        throw new Error("Division by zero is not allowed");
    }
    return a / b;
}

try {
    let result = divide(10, 0);
    print(result);
} catch (error) {
    print(`Error: ${error.message}`);  # Output: Error: Division by zero is not allowed
}
```

---

### 4. Error Object Properties
The Error object in Demi has several properties:

```demi
try {
    throw new Error("Something went wrong");
} catch (error) {
    print(`Message: ${error.message}`);  # The error message
    print(`Stack: ${error.stack}`);      # The stack trace
}
```

---

### 5. Handling Specific Error Types
You can check the type of error to handle different errors differently:

```demi
try {
    # Code that might throw different types of errors
} catch (error) {
    if (error instanceof TypeError) {
        print("Type Error occurred");
    } else if (error instanceof ReferenceError) {
        print("Reference Error occurred");
    } else {
        print("Some other error occurred");
    }
}
```

---

### 6. Async Error Handling
When working with asynchronous code, you can use try-catch with async/await:

```demi
async function fetchData() {
    try {
        let response = await fetch("https://api.example.com/data");
        let data = await response.json();
        return data;
    } catch (error) {
        print(`Error fetching data: ${error.message}`);
        return null;
    }
}
```

---

### 7. Best Practices
1. Only catch errors you can handle
2. Be specific about which errors you catch
3. Always provide meaningful error messages
4. Use finally blocks for cleanup operations
5. Avoid empty catch blocks
6. Log errors for debugging purposes

---

### 8. Summary
- Demi supports try-catch-finally blocks for error handling
- You can throw custom errors using the `throw` statement
- The Error object provides information about the error
- Different types of errors can be handled differently
- Async functions can use try-catch with await