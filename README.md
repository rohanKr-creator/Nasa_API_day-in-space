<h1 style="color: #3b5cff;">🌌 Day in Space</h1>
  <p>
    A simple web app that lets you pick any past date and view what NASA captured that day.<br>
    It pulls from NASA’s public APIs like <strong>Astronomy Picture of the Day (APOD)</strong>, 
    <strong>Earth Polychromatic Imaging Camera (EPIC)</strong>, and 
    <strong>Near-Earth Object (NEO)</strong> feeds.
  </p>

  <h2 style="color:#444;">🚀 Features</h2>
  <ul>
    <li>Fetch Astronomy Picture of the Day (APOD) for any date.</li>
    <li>Browse Earth images from DSCOVR (EPIC).</li>
    <li>View Near-Earth Object (asteroid) close-approach data.</li>
    <li>Simple, responsive UI built with HTML, CSS, and vanilla JavaScript.</li>
  </ul>

  <h2 style="color:#444;">📂 Project Structure</h2>
  <pre style="background:#f4f4f4; padding:10px; border-radius:6px;">
.
├── index.html      # Main app page
├── about.html      # About page
├── styles.css      # Styles
├── app.js          # Main JavaScript
├── .env            # Stores your NASA API key (not pushed to GitHub)
└── .gitignore      # Ensures .env and other private files are not uploaded
  </pre>

  <h2 style="color:#444;">🔑 Setup</h2>
  <h3>1. Clone the repo</h3>
  <pre style="background:#f4f4f4; padding:10px; border-radius:6px;">git clone https://github.com/&lt;your-username&gt;/day-in-space.git
cd day-in-space</pre>

  <h3>2. Add your NASA API key</h3>
  <p>Create a <code>.env</code> file in the root of the project:</p>
  <pre style="background:#f4f4f4; padding:10px; border-radius:6px;">NASA_API_KEY=your_api_key_here</pre>
  <small style="color:#777;">⚠️ <code>.env</code> is ignored by Git and will not be pushed to GitHub.</small>



  <h2 style="color:#444;">🌍 Deployment</h2>
  <ol>
    <li>Go to your repo settings → Pages.</li>
    <li>Select <code>main</code> branch and <code>/ (root)</code> folder.</li>
    <li>Save, then your site will be live at:<br>
      <code>https://&lt;your-username&gt;.github.io/day-in-space/</code>
    </li>
    <li>
      Before pushing, set your API key in <code>index.html</code> inside:
      <pre style="background:#f4f4f4; padding:10px; border-radius:6px;">
&lt;meta name="nasa-api-key" content="YOUR_API_KEY"&gt;
      </pre>
      <small style="color:#777;">This exposes the key publicly, which is fine for NASA’s free key.  
      To fully hide it, you’d need a backend proxy.</small>
    </li>
  </ol>

  <h2 style="color:#444;">🙌 Credits</h2>
  <ul>
    <li>Data & imagery: <a href="https://api.nasa.gov/" target="_blank">NASA Open APIs</a></li>
    <li>Built with plain HTML, CSS, and JavaScript.</li>
  </ul>

## 👨‍🚀 Team Members
- [@RishiSingh1256] (https://github.com/RishiSingh1456)
