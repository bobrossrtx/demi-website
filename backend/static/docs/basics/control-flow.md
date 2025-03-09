---
title: Control Flow
description: Understanding control flow statements in Demi including conditionals and loops
page: basics/control-flow
tags: ["control flow", "basics", "demi", "programming", "if statements", "loops", "try catch"]
order: 4
catid: 1
---

Control flow statements in Demi allow you to control the execution path of your program through conditions and loops. Learn how to make decisions and repeat actions in your code.

---

### 1. Conditional Statements
#### If Statement Syntax
```demi
if (condition) {
    # code block
} elif (another_condition) {
    # code block
} else {
    # code block
}
```

**Example**
```demi
let i = 10;
let x = 10;

if (i < x) {
    print("Less than");
} elif (i > x) {
    print("More than");
} else {
    print("Equal to");
}
# Output: Equal to
```

---

### 2. Loops
#### 2.1 For Loops
Use for loops when you know the number of iterations needed:

```demi
for (let i = 0; i <= 10; i = i + 1) {
    print(i);
}
# Output: 0 1 2 3 4 5 6 7 8 9 10
```

#### 2.2 While Loops
While loops continue as long as a condition is true:

```demi
let x = 0;
while (x <= 10) {
    print(x);
    x = x + 2;
}
# Output: 0 2 4 6 8 10
```

---

### 3. Special Control Flow (Coming Soon)
These features are planned for future releases:

#### 3.1 Breaking Out of Loops
```demi
# Not yet implemented
for (let i = 0; i < 10; i = i + 1) {
    if (i === 5) break;
    print(i);
}
```

#### 3.2 Exception Handling
```demi
# Not yet implemented
try {
    riskyOperation();
} catch (error) {
    print(error);
}
```

---

### 4. Best Practices
1. Always use curly braces `{}` for code blocks
2. Maintain consistent indentation
3. Keep conditions simple and readable
4. Avoid deeply nested conditions
5. Use meaningful variable names in loops

---

### 5. Summary
- If statements use `if`, `elif`, and `else` keywords
- Two types of loops available: `for` and `while`
- Future releases will include:
  - Loop control statements (break, continue)
  - Exception handling (try/catch)
- Always use proper indentation and braces