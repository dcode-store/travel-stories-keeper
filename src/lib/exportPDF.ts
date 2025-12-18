import { Memory } from '@/types/memory';

export async function exportToPDF(memories: Memory[]): Promise<void> {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups.');
  }

  const sortedMemories = [...memories].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Journo - My Memory Lane</title>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          color: #2d2a26;
          line-height: 1.6;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        h1, h2, h3 {
          font-family: 'Cormorant Garamond', serif;
        }
        
        .cover {
          text-align: center;
          padding: 100px 20px;
          page-break-after: always;
        }
        
        .cover h1 {
          font-size: 48px;
          font-weight: 500;
          margin-bottom: 16px;
          color: #c97b4a;
        }
        
        .cover p {
          font-size: 18px;
          color: #666;
        }
        
        .memory {
          page-break-inside: avoid;
          margin-bottom: 60px;
          padding-bottom: 40px;
          border-bottom: 1px solid #e5e0d9;
        }
        
        .memory:last-child {
          border-bottom: none;
        }
        
        .memory-date {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #c97b4a;
          margin-bottom: 8px;
        }
        
        .memory-title {
          font-size: 28px;
          font-weight: 500;
          margin-bottom: 20px;
        }
        
        .memory-images {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .memory-images img {
          max-width: 300px;
          max-height: 200px;
          object-fit: cover;
          border-radius: 8px;
        }
        
        .memory-content {
          font-size: 14px;
          white-space: pre-wrap;
          color: #444;
        }
        
        .footer {
          text-align: center;
          padding: 40px 20px;
          font-size: 12px;
          color: #999;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .memory {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="cover">
        <h1>My Memory Lane</h1>
        <p>A collection of ${memories.length} ${memories.length === 1 ? 'memory' : 'memories'}</p>
        <p style="margin-top: 40px; font-size: 14px; color: #999;">Created with Journo</p>
      </div>
      
      ${sortedMemories.map(memory => `
        <div class="memory">
          <div class="memory-date">${formatDate(memory.date)}</div>
          <h2 class="memory-title">${escapeHtml(memory.title)}</h2>
          ${memory.images.length > 0 ? `
            <div class="memory-images">
              ${memory.images.slice(0, 4).map(img => `<img src="${img}" alt="" />`).join('')}
            </div>
          ` : ''}
          ${memory.content ? `<div class="memory-content">${escapeHtml(memory.content)}</div>` : ''}
        </div>
      `).join('')}
      
      <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
