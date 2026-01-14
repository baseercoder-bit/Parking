# Script to update DATABASE_URL in .env file
param(
    [Parameter(Mandatory=$true)]
    [string]$Password
)

$envFile = ".env"
$connectionString = "postgresql://postgres.dccnxyfwvazfnpquxnuy:$Password@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

if (Test-Path $envFile) {
    $content = Get-Content $envFile
    
    # Update or add DATABASE_URL
    $updated = $false
    $newContent = $content | ForEach-Object {
        if ($_ -match '^DATABASE_URL=') {
            $updated = $true
            "DATABASE_URL=`"$connectionString`""
        } else {
            $_
        }
    }
    
    if (-not $updated) {
        # Add DATABASE_URL if it doesn't exist
        $newContent += "DATABASE_URL=`"$connectionString`""
    }
    
    $newContent | Set-Content $envFile -Encoding utf8
    Write-Host "✓ Updated DATABASE_URL in .env file" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
}

