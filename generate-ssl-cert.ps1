# PowerShell script to generate SSL certificates for Windows

# Create directory for SSL certificates
$sslPath = "$PSScriptRoot\ssl"
New-Item -Path $sslPath -ItemType Directory -Force | Out-Null

# Check if OpenSSL is installed and available
$opensslInstalled = $null
try {
    $opensslInstalled = Get-Command openssl -ErrorAction Stop
    Write-Host "OpenSSL found at: $($opensslInstalled.Source)"
} catch {
    Write-Host "ERROR: OpenSSL not found. Please install OpenSSL for Windows." -ForegroundColor Red
    Write-Host "You can download it from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
    exit 1
}

# Generate self-signed certificate
Write-Host "Generating certificates..." -ForegroundColor Green
try {
    # Use openssl without setting the config file
    & openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
      -keyout "$sslPath\private.key" `
      -out "$sslPath\certificate.crt" `
      -subj "/CN=localhost" `
      -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
    
    if ($LASTEXITCODE -ne 0) {
        throw "OpenSSL command failed with exit code $LASTEXITCODE"
    }
    
    # Verify the files were created
    if (!(Test-Path "$sslPath\private.key") -or !(Test-Path "$sslPath\certificate.crt")) {
        throw "Certificate files were not created properly"
    }
    
    # Set proper permissions for the current user
    $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($currentUser, "Read,Write", "Allow")
    
    $acl = Get-Acl "$sslPath\private.key"
    $acl.SetAccessRule($accessRule)
    Set-Acl "$sslPath\private.key" $acl
    
    $acl = Get-Acl "$sslPath\certificate.crt" 
    $acl.SetAccessRule($accessRule)
    Set-Acl "$sslPath\certificate.crt" $acl
    
    Write-Host "Self-signed certificates created in $sslPath" -ForegroundColor Green
    Write-Host "Key permissions updated to be readable by the current user" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to generate certificates: $_" -ForegroundColor Red
    exit 1
}
