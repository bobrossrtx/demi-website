---
title: Installation
description: Installing Demi Script for Linux, MacOS, and Windows and Setting up your environment
page: getting-started/installation
tags: ["guide", "guides", "getting-started", "getting started", "demi", "installation"]
order: 1
catid: 0
---

To begin using Demi, you’ll first need to install it. There are several ways to download Demi Script and its associated tools, but an active internet connection is required for the process.

The steps below will guide you through installing the latest stable version of Demi. While the documentation is designed to align with the output of newer versions, occasional deviations may occur. Rest assured, we strive to keep the documentation up to date with the latest version of Demi.

---

### Command Line Notation

In this page of the documentation, we'll show you some commands uses within the terminal. Lines that you should enter in a terminal will start with `$`. (You don't need to type the `$` character). It is the command line prompt shown to indicate the start of every command. Lines that don't start with $ are typically the output of the previous command. Additionally, any PowerShell specific examples will use `>` rather than `$`.

---

### Installing Demi on Linux or MacOS

If you're using Linux or macOS, you can either download the zipped precompiled binary from the [download](https://demi-website.fly.dev/downloads) page or you can open a terminal and enter the following command:

```shell
$ curl --proto '=https' --tlsv1.2 https://demi-website.fly.dev/static/downloads/install.sh -sSf | sh
```

The command above downloads a script and will automatically start the installation of Demi. This will install the most up to date source code version and compile from your computer. You might be prompted your password. If the install is successful, the following line should appear:

```
Installation Complete!
```

You may need to add the binaries to your path, which can be done though your `.bashrc` or other shell config file.

---

### Installing Demi on Windows

On windows, you can do the same technique, either using the Windows installer or precompiled binary on the [download](https://demi-website.fly.dev/downloads) page, or you can open PowerShell and run this set of commands.

```powershell
> $tempdir="C:\Users\$env:USERNAME\AppData\Local\Temp"
> Invoke-WebRequest -Uri 'https://demi-website.fly.dev/static/downloads/install.ps1' -OutFile $tempdir/demi-install.ps1
> powershell $tempdir/demi-install.ps1
```

---

## Troubleshooting

(To be added)