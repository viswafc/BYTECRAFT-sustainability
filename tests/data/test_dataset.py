import pandas as pd
import pytest

from ml.preprocessing.pipeline import DatasetSchemaError, load_dataset, validate_dataset
from ml.schemas import DEFAULT_DATASET_PATH, RAW_COLUMNS, TARGET


def test_dataset_exists_and_loads():
    df = load_dataset(DEFAULT_DATASET_PATH)
    assert df.shape == (5000, 13)
    assert set(df.columns) == set(RAW_COLUMNS)


def test_dataset_integrity():
    df = load_dataset(DEFAULT_DATASET_PATH)
    assert df.isnull().sum().sum() == 0
    assert df.duplicated().sum() == 0
    assert set(df[TARGET].unique()) == {0, 1}
    assert (df["Location_Code"] == df["Zone"] + "_" + df["Block"] + "_" + df["Pipe"]).all()


def test_schema_validation_rejects_missing_columns():
    with pytest.raises(DatasetSchemaError):
        validate_dataset(pd.DataFrame({"Pressure": [1.0]}))


def test_schema_validation_rejects_non_binary_target():
    df = load_dataset(DEFAULT_DATASET_PATH).head(5).copy()
    df.loc[0, TARGET] = 2
    with pytest.raises(DatasetSchemaError):
        validate_dataset(df)


def test_load_without_target_for_inference_files():
    df = load_dataset(DEFAULT_DATASET_PATH.parent / "testing.csv", require_target=False)
    assert TARGET not in df.columns and len(df) == 2
