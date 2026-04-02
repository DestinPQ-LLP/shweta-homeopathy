import * as fs from 'fs';
import * as path from 'path';

function findEmojis(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findEmojis(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      // Regex to match emojis (modern surrogate pairs & specific blocks)
      const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;
      
      let match;
      const issues = [];
      while ((match = emojiRegex.exec(content)) !== null) {
        issues.push({ char: match[0], index: match.index });
      }

      if (issues.length > 0) {
        console.log(`\nFound emojis in ${fullPath}:`);
        for (const issue of issues) {
           const snippet = content.substring(Math.max(0, issue.index - 20), Math.min(content.length, issue.index + 20)).replace(/\n/g, ' ');
           console.log(` - ${issue.char} at snippet: "...${snippet}..."`);
        }
      }
    }
  }
}

console.log("Searching for emojis in /app, /components, /lib...");
findEmojis(path.join(process.cwd(), 'app'));
findEmojis(path.join(process.cwd(), 'components'));
findEmojis(path.join(process.cwd(), 'lib'));
console.log("Done searching.");
