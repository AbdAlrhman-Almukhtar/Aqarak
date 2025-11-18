DATA?=all-cleaned-data_v2.csv
OUT?=models

train:
	python3 scripts/train_price_model.py --csv $(DATA) --outdir $(OUT) --config ml_config.yaml | tee $(OUT)/train_log.json

link-latest:
	ln -sf $$(ls -t models/aqarak_price_model_*.joblib | head -n1) models/aqarak_price_model_latest.joblib

serve:
	AQARAK_MODEL_PATH=models/aqarak_price_model_latest.joblib uvicorn app.server:app --reload --port 8000
