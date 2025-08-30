//Copy this file to config.js and specify your own settings

export let DEFAULT_APP_SETTINGS = {
  locale:"es",
  theme: "dark",
  mainTitleText: "",
  files: {
    "/index.html": {
      active: true,
      readOnly: true,
      code: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />

    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <h1>Counter</h1>
    <p id="value">0</p>
    <button id="inc">Increment</button>
    <script type="module" src="/index.js"></script>
  </body>
</html>`
    },
    "/styles.css": {
      code: `body { 
  font-family: system-ui, sans-serif; 
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
}
button { 
  padding: .5rem 1rem;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #0052a3;
}
#value { 
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}`
    },
    "/index.js": {
      code: `// Utility functions (exported for testing)
export function add(a, b) { 
  return a + b; 
}

export function multiply(a, b) {
  return a * b;
}

// Counter application
let v = 0;
const el = document.getElementById('value');
const btn = document.getElementById('inc');

function render() { 
  if (el) {
    el.textContent = String(v);
  }
}

if (btn) {
  btn.addEventListener('click', () => {
    v = add(v, 1); // Using our add function
    render();
  });
}

render();`
    },
    "/utils.test.js": {
      readOnly: false,
       hidden: true,
      code: `
 test('clicking increment button should increase counter by 1', () => {
  const valueEl = document.getElementById('value');
  const incBtn = document.getElementById('inc');
  
  // Get current value
  const initialValue = parseInt(valueEl.textContent);
  
  // Click the button
  incBtn.click();
  
  // Check if value increased
  const newValue = parseInt(valueEl.textContent);
  expect(newValue).toBe(initialValue + 1);


});


 test('other', () => {
    expect(2).toBe(2);
  });`
    }
  }
};

export const ESCAPP_CLIENT_SETTINGS = {
  imagesPath:"./images/",
};

export const MAIN_SCREEN = "MAIN_SCREEN";
export const MESSAGE_SCREEN = "MESSAGE_SCREEN";