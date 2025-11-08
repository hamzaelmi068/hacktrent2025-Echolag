# EchoLag Backend

## Python Environment

1. **Install the requested Python version**
   - The project targets Python `3.11.9` (`.python-version` included).
   - Use `pyenv install 3.11.9` or ensure your system Python matches.

2. **Create a virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```

3. **Install project requirements**
   ```bash
   pip install --upgrade pip
   pip install -e ".[dev]"
   ```

   This reads `pyproject.toml`, installing runtime packages (currently none) plus the dev extras defined under `project.optional-dependencies.dev`.

4. **Useful commands**
   ```bash
   # Run the Ruff linter
   ruff check .

   # Format (optional rule)
   ruff format .

   # Run tests (pytest auto-discovers in src/ or tests/)
   pytest
   ```

5. **Configure ElevenLabs credentials**
   - Create a `.env` file in the `backend/` directory (ignored by git).
   - Add your API key (obtain it from the ElevenLabs dashboard):
     ```
     ELEVENLABS_API_KEY=your-secret-key
     ```
   - Alternatively, export the variable in your shell session before running code.

6. **Quick sanity check**
   ```bash
   python - <<'PY'
   from echolag.clients.elevenlabs_client import list_available_models
   models = list_available_models()
   print(f"Fetched {len(models)} ElevenLabs model(s).")
   PY
   ```

7. **Environment layout**
   ```
   backend/
   ├── .gitignore         # ignores virtualenvs, caches, env files
   ├── .python-version    # pinned interpreter version
   ├── pyproject.toml     # project + dev dependencies, tooling configs
   ├── README.md          # this guide
   └── src/
       └── echolag/
           ├── __init__.py
           └── clients/
               └── elevenlabs_client.py
   ```

Create application code under `backend/src/` (e.g., `backend/src/echolag/`) and add tests to `backend/tests/`.