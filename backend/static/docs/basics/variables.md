---
title: Variables and Data Types
description: Understanding Demi Variables and Data Types
page: basics/variables
tags: ["variables", "basics", "demi", "programming", "guide"]
order: 3
catid: 1
---

In Demi, variables are used to store data, and the language supports various data types to represent different kinds of information. This guide will walk you through the basics of declaring variables and working with data types.

---

### 1. Declaring Variables
#### Syntax
Variables in Demi are declared using either `let` keyword:
```demi
let variableName = value;
```

**Example**
```demi
# Declare a variable
let message = "Hello, Demi!";
print(message);  # Output: Hello, Demi!
```

---

### 2. Data Types

Demi supports several data types, including numbers, strings, arrays, and objects. Below is an overview of each type

---

#### 2.1 Numbers

Numbers in Demi can be integers or floating-point values

**Example**
```demi
let integer = 42;
let float = 3.14;

print(`Integer: ${integer}`);  # Output: Integer: 42
print(`Float: ${float}`);      # Output: Float: 3.14
```
---

#### 2.2 Strings

Strings are sequences of characters enclosed in `double`/`single` quotes `"`/`'` or used with template strings by using backticks ``` ` ```.

**Example**
```demi
let greeting = "Hello, World!";
let name = "Demi";

# Using template strings
let message = `Welcome, ${name}!`;

print(greeting);  # Output: Hello, World!
print(message);   # Output: Welcome, Demi!
```
---

#### 2.3 Arrays

Arrays are collections of values, which can be of any data type. They are defined using square brackets `[]` .

**Example**
```demi
let numbers = [1, 2, 3, 4, 5];
let mixed = [1, "two", 3.0, true];

print(`Numbers: ${numbers}`);  # Output: Numbers: [1, 2, 3, 4, 5]
print(`Mixed: ${mixed}`);      # Output: Mixed: [1, "two", 3.0, true]
```
---

#### 2.4 Objects

Objects are key-value pairs, similar to dictionaries or maps in other languages. They are defined using curly braces `{}`. In Demi, you can perform various operations with objects, such as:

- **Accessing Properties** : Use the dot notation ( `object.property` ) or bracket notation ( `object["property"]` ) to access values.
- **Adding Properties** : Add new key-value pairs dynamically.
- **Updating Properties** : Modify the value of an existing key.
- **Deleting Properties** : Remove a key-value pair using a delete operation.
- **Iterating Over** Properties : Loop through the keys and values of an object.
- **Nested Objects** : Store objects within objects to create complex data structures.

**Example**
```demi
let person = {
    name: "John",
    age: 30,
    isStudent: false
};

print(`Name: ${person.name}`);  # Output: Name: John
print(`Age: ${person.age}`);    # Output: Age: 30
print(`Is Student: ${person.isStudent}`);  # Output: Is Student: false
```
---

### 3. Constants

Demi also supports constants, which are variables that cannot be reassigned. Use the `const` keyword to declare constants.

**Example**
```demi
const pi = 3.14159;
print(`Value of Pi: ${pi}`);  # Output: Value of Pi: 3.14159
```
---

### 4. Type Con

Demi provides implicit and explicit type conversion for certain operations.

**Example**
```
let num = 42;
let str = "The answer is " + num;  # Implicit conversion
print(str);  # Output: The answer is 42
```
---

### 5. Summary

- Use `let` to declare variables and `const` for constants.
- Supported data types include:
    - Numbers
    - Strings
    - Arrays
    - Objects
- Use template strings for string interpolation with `${}` .
