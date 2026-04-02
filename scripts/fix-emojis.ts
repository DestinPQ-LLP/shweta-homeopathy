import * as fs from 'fs';
import * as path from 'path';

function go() {
  const videoFile = path.join(process.cwd(), 'components/public/VideoSection.tsx');
  if (fs.existsSync(videoFile)) {
    let content = fs.readFileSync(videoFile, 'utf8');
    content = content.replace(/<span>🌿<\/span>/g, '<Leaf size={16} color="var(--clr-forest)" />');
    content = content.replace(/<span>🎯<\/span>/g, '<Target size={16} color="var(--clr-forest)" />');
    content = content.replace(/<span>💚<\/span>/g, '<Heart size={16} color="var(--clr-forest)" />');
    content = content.replace(/<span>🎬<\/span> 60–90/g, '<Video size={16} className={styles.metaIcon} /> <span>60–90');
    
    if (!content.includes('import { Play, Leaf, Target, Heart, Video } from \'lucide-react\';') &&
         content.includes('import { Play } from \'lucide-react\';')) {
      content = content.replace('import { Play } from \'lucide-react\';', 'import { Play, Leaf, Target, Heart, Video } from \'lucide-react\';');
    }
    fs.writeFileSync(videoFile, content);
    console.log("Fixed VideoSection");
  }

  const libFile = path.join(process.cwd(), 'lib/conditions.ts');
  if (fs.existsSync(libFile)) {
    let content = fs.readFileSync(libFile, 'utf8');
    content = content.replace(/icon: '🌿'/g, "icon: 'Leaf'");
    content = content.replace(/icon: '🌸'/g, "icon: 'Flower'");
    content = content.replace(/icon: '🦴'/g, "icon: 'Bone'");
    content = content.replace(/icon: '🌺'/g, "icon: 'Activity'");
    content = content.replace(/icon: '💊'/g, "icon: 'Pill'");
    content = content.replace(/icon: '🌳'/g, "icon: 'TreePine'");
    content = content.replace(/icon: '🧠'/g, "icon: 'Brain'");
    content = content.replace(/icon: '🫁'/g, "icon: 'Activity'");
    content = content.replace(/icon: '👶'/g, "icon: 'Baby'");
    content = content.replace(/icon: '✨'/g, "icon: 'Sparkles'");
    content = content.replace(/icon: '🫧'/g, "icon: 'Droplets'");
    content = content.replace(/icon: '🌱'/g, "icon: 'Sprout'");
    fs.writeFileSync(libFile, content);
    console.log("Fixed lib/conditions.ts");
  }

  const reviewFile = path.join(process.cwd(), 'components/public/GoogleReviewWidget.tsx');
  if (fs.existsSync(reviewFile)) {
    let content = fs.readFileSync(reviewFile, 'utf8');
    content = content.replace("const STAR = '★';", "const STAR = 'S';");
    content = content.replace("const EMPTY_STAR = '☆';", "const EMPTY_STAR = 'E';");
    content = content.replace("return <span key={i} className={styles.star}>{STAR}</span>;", "return <Star key={i} size={16} fill=\"var(--clr-gold)\" color=\"var(--clr-gold)\" />;");
    content = content.replace("return <span key={i} className={styles.starEmpty}>{EMPTY_STAR}</span>;", "return <Star key={i} size={16} color=\"var(--clr-gold-dark)\" />;");
    
    if (!content.includes('import { Star } from \'lucide-react\';')) {
        content = "import { Star } from 'lucide-react';\n" + content;
    }
    fs.writeFileSync(reviewFile, content);
    console.log("Fixed GoogleReviewWidget");
  }

  const testFile = path.join(process.cwd(), 'components/public/TestimonialCarousel.tsx');
  if (fs.existsSync(testFile)) {
    let content = fs.readFileSync(testFile, 'utf8');
    content = content.replace(/>★<\/span>/g, '><Star size={14} fill="var(--clr-gold)" color="var(--clr-gold)" /></span>');
    if (!content.includes('import { Star } from \'lucide-react\';') && !content.includes('import { Star,')) {
        if (content.includes('import { useState }')) {
           content = content.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { Star } from 'lucide-react';");
        } else {
           content = "import { Star } from 'lucide-react';\n" + content;
        }
    }
    fs.writeFileSync(testFile, content);
    console.log("Fixed TestimonialCarousel");
  }
}

go();
