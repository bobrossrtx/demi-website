---
title: Installation
description: Installing Demi Script for Linux, MacOS, and Windows
page: getting-started/installation.md
tags: ["guide", "guides", "getting-started", "getting started", "demi", "installation"]
---

To get started with Demi, we must install it. There are multiple ways in which you can download Demi Script and the tools associated, You will need an internet connection for the download.

The following steps will install the latest stable version of Demi. The documentation should stay consistent with output of newer versions of Demi however might deviate occasionally. Basically, the documentation should be up to date with the latest version of Demi.

---

## Command Line Notation

In this page of the documentation, we'll show you some commands uses within the terminal. Lines that you should enter in a terminal will start with `$`. (You don't need to type the `$` character). It is the command line prompt shown to indicate the start of every command. Lines that don't start with $ are typically the output of the previous command. Additionally, any PowerShell specific examples will use `>` rather than `$`.

---

## Installing Demi on Linux or MacOS

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

## Installing Demi on Windows

On windows, you can do the same technique, either using the Windows installer or precompiled binary on the [download](https://demi-website.fly.dev/downloads) page, or you can open PowerShell and run this set of commands.

```powershell
> $tempdir="C:\Users\$env:USERNAME\AppData\Local\Temp"
> Invoke-WebRequest -Uri 'https://demi-website.fly.dev/static/downloads/install.ps1' -OutFile $tempdir/demi-install.ps1
> powershell $tempdir/demi-install.ps1
```

---

## Troubleshooting

(To be added)