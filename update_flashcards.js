const fs = require('fs');

try {
  const text = fs.readFileSync('flashcards.txt', 'utf8');
  
  const lines = text.split('\n')
    .filter(l => !l.startsWith('#') && l.trim() !== '')
    .map(l => l.split('\t'))
    .filter(p => p.length >= 2)
    .map(p => ({ front: p[0].trim(), back: p[1].trim() }));
    
  const output = `const windowFlashcards = ${JSON.stringify(lines, null, 2)};`;
  fs.writeFileSync('flashcards.js', output);
  
  console.log(`Successfully converted ${lines.length} flashcards to flashcards.js`);
} catch (e) {
  console.error("Error converting flashcards:", e.message);
}
