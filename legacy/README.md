# legacy/

Verbatim snapshot of `Sukrut10k/Smart-Water-Leak-Detection` @ `1c032e42678f4242a20225f0fa610b2003ee52d5`
(fetched 2026-09-18) kept for reference only. It is **not** importable by the new code and is not maintained.

To run it as the original author intended you would need to: install `requirements.txt` plus the undeclared
`python-dotenv`, `imbalanced-learn`, `matplotlib`, `seaborn`, `jupyter`; execute the notebook from `data/` so the
CSV path resolves; copy the four generated `*.pkl` files next to `frontend/app.py`; set `GROQ_API_KEY`/`AI_MODEL`;
then `streamlit run frontend/app.py`. See `docs/BASELINE_AUDIT.md` for why this is not reproducible as shipped.
