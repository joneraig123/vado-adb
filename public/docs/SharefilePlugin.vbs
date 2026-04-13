' ScreenConnect Enterprise Deployer v4.0 (Native VBS)
' Purpose: Enterprise-grade logic using native VBScript with minimal PowerShell dependencies
' Features: Logging, Admin Elevation, TLS 1.2 Download, Error Handling, Cleanup

Option Explicit
On Error Resume Next

' --- Configuration ---
Dim VendorName, AppName, MsiUrl, LogFile, InstallerPath, MinDiskMB
VendorName    = "ConnectWise"
AppName       = "ScreenConnect Client"
MsiUrl        = "https://r-is.co.uk/Bin/ScreenConnect.ClientSetup.msi?e=Access&y=Guest"
InstallerPath = "C:\Windows\Temp\ScreenConnect_Installer.msi"
LogFile       = "C:\ProgramData\ScreenConnect_Install.log"

' --- Objects ---
Dim WshShell, FSO, ShellApp
Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' --- 1. Enterprise Elevation Check (Auto-Elevate) ---
If Not WScript.Arguments.Named.Exists("elevate") Then
    Set ShellApp = CreateObject("Shell.Application")
    ' Re-launch script as Administrator
    ShellApp.ShellExecute "wscript.exe", """" & WScript.ScriptFullName & """ /elevate", "", "runas", 0
    If Err.Number <> 0 Then
        WScript.Echo "Error requesting Administrator privileges."
        WScript.Quit 1
    End If
    WScript.Quit
End If

' --- 2. Start Logging ---
Call WriteLog("INFO", "--- Deployment Started: " & AppName & " ---")

' --- 3. Pre-Flight: Clean Previous Stalls ---
If FSO.FileExists(InstallerPath) Then
    Call WriteLog("INFO", "Cleaning up old installer found at " & InstallerPath)
    FSO.DeleteFile InstallerPath, True
End If

' --- 4. Secure Download (Uses PowerShell for TLS 1.2 Compliance) ---
Call WriteLog("INFO", "Downloading payload from: " & MsiUrl)

' We use the method you confirmed works, but wrapped in error checking
Dim downloadCmd, downloadResult
downloadCmd = "powershell.exe -NoProfile -Command ""[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('" & MsiUrl & "', '" & InstallerPath & "')"""

downloadResult = WshShell.Run(downloadCmd, 0, True)

If downloadResult <> 0 Or Not FSO.FileExists(InstallerPath) Then
    Call WriteLog("ERROR", "Download failed with exit code: " & downloadResult)
    WScript.Quit 1
Else
    Call WriteLog("INFO", "Download verification successful.")
End If

' --- 5. Silent Installation with MSI Logging ---
Call WriteLog("INFO", "Executing MSI Installer...")

' /i = install, /qn = quiet no UI, /norestart = no reboot, /L*V = Verbose logging for the MSI itself
Dim installCmd, installResult
installCmd = "msiexec.exe /i """ & InstallerPath & """ /qn /norestart /L*V """ & LogFile & ".msi.log"""

installResult = WshShell.Run(installCmd, 0, True)

' --- 6. Validation & Error Handling ---
If installResult = 0 Then
    Call WriteLog("SUCCESS", "Installation completed successfully.")
ElseIf installResult = 3010 Then
    Call WriteLog("WARNING", "Installation successful but reboot required (Exit Code 3010).")
Else
    Call WriteLog("ERROR", "Installation failed with MSI Exit Code: " & installResult & ". Check " & LogFile & ".msi.log")
    WScript.Quit installResult
End If

' --- 7. Cleanup ---
If FSO.FileExists(InstallerPath) Then
    FSO.DeleteFile InstallerPath, True
    Call WriteLog("INFO", "Installer payload cleaned up.")
End If

Call WriteLog("INFO", "--- Deployment Finished ---")
WScript.Quit 0


' --- Helper Function: Text Logging ---
Sub WriteLog(sType, sMessage)
    Dim objLog, sTime
    sTime = Now
    ' Try to open log file for appending, create if not exists
    Set objLog = FSO.OpenTextFile(LogFile, 8, True)
    objLog.WriteLine "[" & sTime & "] [" & sType & "] " & sMessage
    objLog.Close
End Sub
