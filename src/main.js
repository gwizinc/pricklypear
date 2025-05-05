console.log('Main.js loaded');
console.log('Executing main script');
  const rootElement = document.getElementById('root');
  
  const app = document.createElement('div');
  app.className = 'p-8 bg-background text-foreground';
  
  const heading = document.createElement('h1');
  heading.textContent = 'Prickly Pear';
  heading.className = 'text-4xl font-bold mb-4';
  
  const paragraph = document.createElement('p');
  paragraph.textContent = 'This is a test to verify CSS is working properly.';
  paragraph.className = 'text-lg';
  
  app.appendChild(heading);
  app.appendChild(paragraph);
  rootElement.appendChild(app);
