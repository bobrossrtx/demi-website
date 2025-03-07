---
title: Writing Your First Program
description: Writing your first Demi Script program
page: getting-started/first-program
tags: ["guide", "guides", "getting-started", "getting started", "demi", "first program", "program", "script"]
order: 2
catid: 0
---

### Step 1: Creating a New File

Create a new file with the `.dem` extension. For example:
```
Workspace:/src/first_program.dem
```

### Step 2: Writing Your Code

Open the file in a text editor and write the following code:
```demi
# My First Demi Program

# Define a variable
const message = "Hello, Demi!";

# Print the variable
print(message);
```

### Step 3: Running the Program

Open a terminal and navigate to the directory where your `.dem` file is located. Then, run the following command:

```sh
$ demi first_program.dem
```

### Expected outcome

You should see the following output:

```
Hello, Demi!
```

### Step 4: Understanding the Code
Let's break down the code:
- `# My First Demi Program` is a comment that describes the program.
- `const message = "Hello, Demi!";` defines a variable called `message` and assigns it the value `"Hello, Demi!"`.
- `print(message);` prints the value of the `message` variable to the console.


### Next Steps

Congratulations! Now that you've created your first Demi program, you can explore more Demi features and start building your own programs.

Here are some ideas to explore:
- [variables](): Experiment with numbers, strings and arrays.
- [functions](): Learn how to define and call functions.
- [control flow](): Learn how to use `if`, `else` and `for` loops.
- [Loops](): Learn how to use `while` loops.
