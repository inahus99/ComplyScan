const fs = require('fs');
const path = require('path');
const targetPath = path.resolve(__dirname, 'client/src/ScannerPage.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

const motionWrapStart = '<motion.div\n  initial={{ opacity: 0, y: 15 }}\n  animate={{ opacity: 1, y: 0 }}\n  transition={{ duration: 0.5, ease: "easeOut" }}\n>\n  <Card\n    withBorder';
const motionWrapEnd = '</Card>\n</motion.div>';

// Safely split and join instead of regex
content = content.split('<Card\\n    withBorder').join(motionWrapStart);
content = content.split('</Card>').join(motionWrapEnd);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('ScannerPage wraps applied successfully using split/join.');
