const fs = require('fs');
const path = require('path');

// Map of old files to new files
const fileMap = [
  { old: 'app/onboarding/page.tsx', new: 'app/pages/OnboardingPage.tsx' },
  { old: 'app/create/page.tsx', new: 'app/pages/CreateWalletPage.tsx' },
  { old: 'app/import/page.tsx', new: 'app/pages/ImportWalletPage.tsx' },
  { old: 'app/create-password/page.tsx', new: 'app/pages/CreatePasswordPage.tsx' },
  { old: 'app/login/page.tsx', new: 'app/pages/LoginPage.tsx' },
  { old: 'app/dashboard/page.tsx', new: 'app/pages/DashboardPage.tsx' },
];

fileMap.forEach(({ old, new: newFile }) => {
  if (!fs.existsSync(old)) {
    console.log(`Skipping ${old} - file not found`);
    return;
  }

  let content = fs.readFileSync(old, 'utf8');
  
  // Replace imports
  content = content.replace(
    /import\s+{\s*useExtensionRouter\s*}\s+from\s+["']@\/lib\/extensionRouter["'];?/g,
    "import { useNavigate } from 'react-router-dom';"
  );
  
  // Replace router initialization
  content = content.replace(
    /const\s+router\s*=\s*useExtensionRouter\(\);?/g,
    'const navigate = useNavigate();'
  );
  
  // Replace router.push() with navigate()
  content = content.replace(/router\.push\(/g, 'navigate(');
  
  // Replace router.back() with navigate(-1)
  content = content.replace(/router\.back\(\)/g, 'navigate(-1)');
  
  // Replace router.replace() with navigate(..., { replace: true })
  content = content.replace(/router\.replace\(([^)]+)\)/g, 'navigate($1, { replace: true })');
  
  // Ensure directory exists
  const dir = path.dirname(newFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write new file
  fs.writeFileSync(newFile, content, 'utf8');
  console.log(`✅ Converted ${old} → ${newFile}`);
});

console.log('\n✨ Conversion complete!');

