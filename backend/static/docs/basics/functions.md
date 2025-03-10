---
title: Functions
description: Understanding functions in Demi - declaration, parameters, and return values
page: basics/functions
tags: ["functions", "basics", "demi", "programming", "guide"]
order: 5
catid: 1
---

Functions in Demi are reusable blocks of code that perform specific tasks. They can accept parameters and return values, making them essential building blocks for organizing and structuring your code.

---

### 1. Basic Function Declaration
#### Syntax
```demi
fn functionName() {
    # function body
}
```

**Example**
```demi
fn greet() {
    print("Hello, World!");
}

greet();
# Output: Hello, World!
```

---

### 2. Functions with Parameters
#### Parameter Syntax
```demi
fn functionName(param1, param2) {
    # function body using parameters
}
```

**Example**
```demi
fn greetPerson(name) {
    print("Hello, " + name + "!");
}

greetPerson("Alice");
# Output: Hello, Alice!
```

---

### 3. Return Values
Functions can return values using the `return` keyword:

```demi
fn add(a, b) {
    return a + b;
}

let result = add(5, 3);
print(result);
# Output: 8
```

---

### 4. Common Use Cases
- Processing data
- Organizing code into reusable blocks
- Creating modular functionality
- Performing calculations
- Handling repeated operations

---

### 5. Best Practices
1. Use descriptive function names
2. Keep functions focused on a single task
3. Limit the number of parameters
4. Document function purpose and parameters
5. Return consistent data types

---

### 6. Summary
- Functions are declared using the `fn` keyword
- Parameters allow functions to accept input values
- The `return` keyword sends values back to the caller
- Functions help organize and reuse code
- Well-structured functions make code more maintainable