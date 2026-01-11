# Neutralino dev files

This folder contains minimal files used during development with Neutralino.

Files:
- `neutralino.config.json`: Neutralino configuration (includes `cli.resourcesPath` for neu run).
- `services.json`: Example response for `window.electronAPI.getServices()` used by the shim.
- `app.log`: Example log file read by the shim.

Run dev (if frontend running at http://localhost:5173):

```powershell
# terminal A
npm run dev

# terminal B (optional, if npm run dev didn't launch neu automatically)
cd neutralino
npx @neutralinojs/neu run
```

If you prefer to run neu manually while developing the frontend, run Vite first and then `neu run` from this folder.
