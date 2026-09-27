const os = require("os");
const fs = require("fs");
const path = require("path");

const interfaces = os.networkInterfaces();

let localIP = null;

for (const name of Object.keys(interfaces)) {
  for (const network of interfaces[name] || []) {
    if (
      network.family === "IPv4" &&
      !network.internal &&
      !network.address.startsWith("169.254.")
    ) {
      localIP = network.address;
      break;
    }
  }

  if (localIP) break;
}

if (!localIP) {
  console.error("Could not detect local IPv4 address.");
  process.exit(1);
}

const envPath = path.join(__dirname, "..", ".env.local");

let envContent = "";

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf8");
}

const backendUrl = `http://${localIP}:5000`;

if (/^NEXT_PUBLIC_BACKEND_URL=.*$/m.test(envContent)) {
  envContent = envContent.replace(
    /^NEXT_PUBLIC_BACKEND_URL=.*$/m,
    `NEXT_PUBLIC_BACKEND_URL=${backendUrl}`
  );
} else {
  envContent += `\nNEXT_PUBLIC_BACKEND_URL=${backendUrl}\n`;
}

fs.writeFileSync(envPath, envContent);

console.log(`Backend URL set to: ${backendUrl}`);