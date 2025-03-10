---
title: Functions
description: Understanding functions in Demi including declaration, parameters, and return values
page: basics/functions
tags: ["functions", "basics", "demi", "programming", "guide", "parameters", "return values"]
order: 5
catid: 1
---

Functions in Demi allow you to group code into reusable blocks. They can accept parameters, perform operations, and return values. This guide will walk you through the basics of defining and using functions in Demi.

---

### 1. Defining Functions
#### Basic Syntax
```demi
function functionName(parameter1, parameter2) {
    # function body
    return value;
}
```

**Example**
```demi
function greet(name) {
    return `Hello, ${name}!`;
}

let message = greet("Demi");
print(message);  # Output: Hello, Demi!
```

---

### 2. Function Parameters
#### 2.1 Default Parameters
You can provide default values for parameters:

```demi
function greet(name = "World") {
    return `Hello, ${name}!`;
}

print(greet());        # Output: Hello, World!
print(greet("Demi"));  # Output: Hello, Demi!
```

#### 2.2 Rest Parameters
Collect multiple arguments into an array:

```demi
function sum(...numbers) {
    let total = 0;
    for (let i = 0; i < numbers.length; i = i + 1) {
        total = total + numbers[i];
    }
    return total;
}

print(sum(1, 2, 3, 4));  # Output: 10
```

---

### 3. Return Values
Functions can return values using the `return` statement:

```demi
function add(a, b) {
    return a + b;
}

let result = add(5, 3);
print(result);  # Output: 8
```

Functions without a `return` statement or with an empty `return` will return `undefined`:

```demi
function noReturn() {
    print("This function doesn't return anything");
}

let result = noReturn();
print(result);  # Output: undefined
```

---

### 4. Anonymous Functions
You can create functions without names, often used as callbacks:

```demi
let greet = function(name) {
    return `Hello, ${name}!`;
};

print(greet("Demi"));  # Output: Hello, Demi!
```

---

### 5. Arrow Functions
A shorter syntax for writing functions:

```demi
let add = (a, b) => a + b;

print(add(5, 3));  # Output: 8
```

With multiple statements:

```demi
let greet = (name) => {
    let message = `Hello, ${name}!`;
    return message;
};

print(greet("Demi"));  # Output: Hello, Demi!
```

---

### 6. Higher-Order Functions
Functions that take other functions as arguments or return functions:

```demi
function operate(a, b, operation) {
    return operation(a, b);
}

let add = (a, b) => a + b;
let multiply = (a, b) => a * b;

print(operate(5, 3, add));      # Output: 8
print(operate(5, 3, multiply));  # Output: 15
```

---

### 7. Recursion
Functions can call themselves:

```demi
function factorial(n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

print(factorial(5));  # Output: 120
```

---

### 8. Best Practices
1. Use descriptive function names that indicate what the function does
2. Keep functions small and focused on a single task
3. Limit the number of parameters to improve readability
4. Use meaningful parameter names
5. Include appropriate comments for complex functions
6. Return early when possible to avoid deep nesting

---

### 9. Summary
- Functions are defined using the `function` keyword
- Parameters allow functions to accept input values
- The `return` statement specifies the output value
- Arrow functions provide a concise syntax for simple functions
- Functions can be passed as arguments to other functions
- Recursion allows functions to call themselves