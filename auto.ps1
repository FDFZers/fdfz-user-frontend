$ErrorActionPreference = 'Stop'

function Add-ExecutableToPath {
    $machinePath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
    $userPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
    $combined = @()

    if ($machinePath) { $combined += $machinePath -split ';' }
    if ($userPath) { $combined += $userPath -split ';' }
    if ($env:Path) { $combined += $env:Path -split ';' }

    $env:Path = ($combined | Where-Object { $_ -and $_.Trim() } | Select-Object -Unique) -join ';'
}

function Ensure-CommandInstalled {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CommandName,

        [Parameter(Mandatory = $true)]
        [string]$PackageId
    )

    if (Get-Command $CommandName -ErrorAction SilentlyContinue) {
        return
    }

    Write-Host "Missing $CommandName. Installing it now..."

    & winget install --id $PackageId --accept-source-agreements --accept-package-agreements --silent
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install $CommandName with winget."
    }

    Add-ExecutableToPath

    if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
        throw "$CommandName still cannot be found after installation."
    }
}

function Select-EmptyFolder {
    Add-Type -AssemblyName System.Windows.Forms

    $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
    $dialog.Description = 'Select an empty folder for the project:'
    $dialog.ShowNewFolderButton = $true

    do {
        $result = $dialog.ShowDialog()
        if ($result -ne [System.Windows.Forms.DialogResult]::OK) {
            throw 'User cancelled the folder selection.'
        }

        $folderPath = $dialog.SelectedPath
        if ([string]::IsNullOrWhiteSpace($folderPath)) {
            [System.Windows.Forms.MessageBox]::Show('Please choose a valid folder.', 'Info', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information) | Out-Null
            continue
        }

        $items = Get-ChildItem -Force -LiteralPath $folderPath -ErrorAction SilentlyContinue
        if ($items) {
            [System.Windows.Forms.MessageBox]::Show('Please select an empty folder.', 'Warning', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning) | Out-Null
            continue
        }

        return $folderPath
    } while ($true)
}

try {
    Write-Host 'Checking required tools...'
    Ensure-CommandInstalled -CommandName 'git' -PackageId 'Git.Git'
    Ensure-CommandInstalled -CommandName 'node' -PackageId 'OpenJS.NodeJS.LTS'

    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host 'pnpm not found. Installing it with npm...'
        & npm install -g pnpm
        if ($LASTEXITCODE -ne 0) {
            throw 'npm install -g pnpm failed.'
        }

        Add-ExecutableToPath
    }

    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        throw 'pnpm installation failed and cannot be found.'
    }

    $repoUrl = 'https://github.com/FDFZers/fdfz-user-frontend.git'
    $targetFolder = Select-EmptyFolder

    Write-Host "Cloning repository into: $targetFolder"
    & git clone $repoUrl $targetFolder
    if ($LASTEXITCODE -ne 0) {
        throw 'git clone failed.'
    }

    Push-Location $targetFolder
    try {
        Write-Host 'Running pnpm install...'
        & pnpm install
        if ($LASTEXITCODE -ne 0) {
            throw 'pnpm install failed.'
        }

        Write-Host 'Starting development server...'
        & pnpm dev
        if ($LASTEXITCODE -ne 0) {
            throw 'pnpm dev failed.'
        }
    }
    finally {
        Pop-Location
    }

    Write-Host 'Script completed successfully.'
}
catch {
    $message = $_.Exception.Message
    [System.Windows.Forms.MessageBox]::Show($message, 'Script failed', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error) | Out-Null
    Write-Error $message
    exit 1
}
