# ScreenConnect Enterprise Deployer v3.0 (Bulletproof Edition)
# Purpose: Idempotent, Secure, Resilient Installation with Pre-Flight Checks

# --- Configuration ---
$VendorName  = "ConnectWise"
$AppName     = "ScreenConnect Client"
$MsiUrl      = "https://r-is.co.uk/Bin/ScreenConnect.ClientSetup.msi?e=Access&y=Guest"
$LogDir      = "$env:ProgramData\Logs\SoftwareInstall"
$LogFile     = "$LogDir\$VendorName-$AppName.log"
$InstallerPath = "$env:TEMP\ScreenConnect_Installer.msi"
$MinDiskMB   = 200

# --- Helper Functions ---
function Write-Log {
    param ([string]$Message, [string]$Type="INFO")
    $TimeStamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$TimeStamp] [$Type] $Message"
    Write-Output $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry -Force
}

# --- Execution ---
try {
    # 0. Setup Logging Directory
    if (-not (Test-Path $LogDir)) { New-Item -Path $LogDir -ItemType Directory -Force | Out-Null }
    Write-Log "Starting deployment of $AppName"

    # 1. Pre-Flight: Admin Rights Check
    if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")) {
        throw "Script must be run as Administrator."
    }

    # 2. Pre-Flight: Disk Space Check
    $FreeSpace = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'" | Select-Object -ExpandProperty FreeSpace
    if (($FreeSpace / 1MB) -lt $MinDiskMB) {
        throw "Insufficient disk space. Required: ${MinDiskMB}MB."
    }

    # 3. Pre-Flight: Idempotency (Don't install if already there)
    $Installed = Get-Package -Name "*ScreenConnect*" -ErrorAction SilentlyContinue
    if ($Installed) {
        Write-Log "Application already installed: $($Installed.Name). Skipping."
        exit 0
    }

    # 4. Secure Download (BITS + TLS 1.2)
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Write-Log "Downloading payload from verified source..."
    Import-Module BitsTransfer
    Start-BitsTransfer -Source $MsiUrl -Destination $InstallerPath -ErrorAction Stop

    # 5. Security: Authenticode Signature Verification
    $Signature = Get-AuthenticodeSignature -FilePath $InstallerPath
    if ($Signature.Status -ne 'Valid') {
        throw "SECURITY ALERT: Digital Signature is INVALID. Potential tampering detected."
    }
    Write-Log "Digital Signature Verified: $($Signature.SignerCertificate.Subject)"

    # 6. Silent Install
    Write-Log "Installing..."
    $InstallArgs = "/i `"$InstallerPath`" /qn /norestart /L*V `"$LogFile`""
    $Process = Start-Process -FilePath "msiexec.exe" -ArgumentList $InstallArgs -Wait -PassThru

    # 7. Validation
    if ($Process.ExitCode -in @(0, 3010)) {
        Write-Log "Installation Successful. Exit Code: $($Process.ExitCode)"
        exit 0
    } else {
        throw "Msiexec failed with exit code $($Process.ExitCode). Check vendor log."
    }

} catch {
    Write-Log "FATAL ERROR: $_" "ERROR"
    exit 1
} finally {
    # 8. Cleanup
    if (Test-Path $InstallerPath) { Remove-Item -Path $InstallerPath -Force }
    Write-Log "Deployment sequence finished."
}
