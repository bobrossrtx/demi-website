---
title: Standard Library Overview
description: An overview of the Demi standard library and its core modules
page: standard-library/overview
tags: ["standard library", "demi", "programming", "guide", "built-in functions", "modules"]
order: 7
catid: 2
---

The Demi standard library provides a collection of built-in functions and modules that help you perform common tasks without having to write the code from scratch. This guide provides an overview of the standard library and its core components.

---

### 1. Core Functions
These are the built-in functions available globally in Demi:

#### 1.1 Input/Output Functions
```demi
# Print to the console
print("Hello, World!");  # Output: Hello, World!

# Get user input (in interactive environments)
let name = input("Enter your name: ");
print(`Hello, ${name}!`);
```

#### 1.2 Type Conversion Functions
```demi
# Convert to string
let num = 42;
let str = toString(num);  # "42"

# Convert to number
let str = "42";
let num = toNumber(str);  # 42

# Convert to boolean
let value = toBoolean("false");  # false
```

#### 1.3 Array Functions
```demi
# Create an array
let arr = [1, 2, 3, 4, 5];

# Get array length
let length = arr.length;  # 5

# Add element to the end
arr.push(6);  # [1, 2, 3, 4, 5, 6]

# Remove last element
let last = arr.pop();  # last = 6, arr = [1, 2, 3, 4, 5]

# Add element to the beginning
arr.unshift(0);  # [0, 1, 2, 3, 4, 5]

# Remove first element
let first = arr.shift();  # first = 0, arr = [1, 2, 3, 4, 5]
```

---

### 2. Math Module
The Math module provides mathematical constants and functions:

```demi
# Constants
print(Math.PI);    # 3.141592653589793
print(Math.E);     # 2.718281828459045

# Basic operations
print(Math.abs(-5));        # 5
print(Math.round(4.7));     # 5
print(Math.floor(4.7));     # 4
print(Math.ceil(4.2));      # 5

# Trigonometric functions
print(Math.sin(Math.PI / 2));  # 1
print(Math.cos(0));            # 1
print(Math.tan(Math.PI / 4));  # 1

# Other functions
print(Math.sqrt(16));       # 4
print(Math.pow(2, 3));      # 8
print(Math.random());       # Random number between 0 and 1
```

---

### 3. String Module
The String module provides functions for working with strings:

```demi
let str = "Hello, World!";

# Get string length
print(str.length);  # 13

# Convert case
print(str.toUpperCase());  # "HELLO, WORLD!"
print(str.toLowerCase());  # "hello, world!"

# Substring
print(str.substring(0, 5));  # "Hello"

# Replace
print(str.replace("World", "Demi"));  # "Hello, Demi!"

# Split
let parts = str.split(", ");  # ["Hello", "World!"]

# Trim
let padded = "  trimmed  ";
print(padded.trim());  # "trimmed"
```

---

### 4. Date and Time
Functions for working with dates and times:

```demi
# Create a new Date object
let now = new Date();  # Current date and time

# Create a specific date
let date = new Date("2023-01-01");

# Get components
print(date.getFullYear());   # 2023
print(date.getMonth());      # 0 (January is 0)
print(date.getDate());       # 1
print(date.getDay());        # 0 (Sunday is 0)
print(date.getHours());      # 0
print(date.getMinutes());    # 0
print(date.getSeconds());    # 0

# Format date
print(date.toDateString());  # "Sun Jan 01 2023"
print(date.toTimeString());  # "00:00:00 GMT+0000"
```

---

### 5. File System (fs)
Functions for working with files and directories:

```demi
# Read a file
let content = fs.readFileSync("path/to/file.txt", "utf8");
print(content);

# Write to a file
fs.writeFileSync("path/to/file.txt", "Hello, Demi!", "utf8");

# Check if file exists
let exists = fs.existsSync("path/to/file.txt");  # true or false

# Get file information
let stats = fs.statSync("path/to/file.txt");
print(stats.size);  # File size in bytes
print(stats.isFile());  # true if it's a file
print(stats.isDirectory());  # true if it's a directory
```

---

### 6. HTTP Module
Functions for making HTTP requests:

```demi
# Make a GET request
http.get("https://api.example.com/data", (response) => {
    let data = "";
    
    response.on("data", (chunk) => {
        data += chunk;
    });
    
    response.on("end", () => {
        print(data);
    });
});

# Make a POST request
let options = {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ name: "Demi" })
};

http.request("https://api.example.com/data", options, (response) => {
    let data = "";
    
    response.on("data", (chunk) => {
        data += chunk;
    });
    
    response.on("end", () => {
        print(data);
    });
});
```

---

### 7. JSON Module
Functions for working with JSON data:

```demi
# Parse JSON string to object
let jsonString = '{"name":"Demi","age":1}';
let obj = JSON.parse(jsonString);
print(obj.name);  # "Demi"

# Convert object to JSON string
let person = { name: "Demi", age: 1 };
let json = JSON.stringify(person);
print(json);  # '{"name":"Demi","age":1}'
```

---

### 8. Summary
- Demi's standard library provides a rich set of built-in functions and modules
- Core functions are available globally
- Specialized functionality is organized into modules
- The standard library covers common tasks like:
  - Input/output operations
  - Mathematical calculations
  - String manipulation
  - Date and time handling
  - File system operations
  - HTTP requests
  - JSON processing