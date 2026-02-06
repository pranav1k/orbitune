import { renderToStaticMarkup } from "react-dom/server";
import { AudioLines } from "lucide-react";
import { writeFile } from "fs/promises";
import { resolve } from "path";

async function generateIcon() {
  const iconSvg = renderToStaticMarkup(
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      background: 'black', // Black background as requested/appropriate for dark theme
      color: '#3b82f6', // Primary Blue
    }}>
      <AudioLines size={384} strokeWidth={2} /> 
    </div>
  );

  // Wrap in SVG
  const svgContent = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%;">
          ${iconSvg}
        </div>
      </foreignObject>
    </svg>
  `;

  // Actually, standard SVG with AudioLines paths might be cleaner if we can extract it, 
  // but foreignObject with the component is easier to render via React.
  // However, foreignObject might be tricky for 'convert' if it doesn't support HTML rendering well.
  // Better approach: Just use the AudioLines SVG string directly if possible, or simple rect + path.
  // But Lucide components return SVG elements.
  
  // Let's try rendering the Lucide component directly as SVG.
  const simpleIconSvg = renderToStaticMarkup(
    <svg 
      width="512" 
      height="512" 
      viewBox="0 0 512 512" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ backgroundColor: 'black' }}
    >
      <rect width="512" height="512" fill="black" />
      <g transform="translate(64, 64) scale(16)"> 
        {/* Scale 24px icon to fit ~384px (16x) inside 512px, centered with padding */}
         <AudioLines color="#3b82f6" strokeWidth={1.5} />
      </g>
    </svg>
  );

  const outputPath = resolve(process.cwd(), "public/icon.svg");
  await writeFile(outputPath, simpleIconSvg);
  console.log(`Generated SVG icon at ${outputPath}`);
}

generateIcon();
