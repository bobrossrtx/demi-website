$oldPreference = $ErrorActionPreference
    $ErrorActionPreference = "stop"
    try {
        if (Get-Command "flyctl.exe") {
            flyctl.exe deploy -a demi-website --wait-timeout 300
        }
    } catch {
        "Flyctl isn't found within your system path, please add it or install it to deploy the website"
    } $ErrorActionPreference = $oldPreference