from __future__ import annotations

from fastapi import APIRouter, Depends

from ...ml import DISCLAIMER, BaselineLeakPredictionService, get_prediction_service
from ...schemas import Envelope, ModelHealth, ModelResponse, PredictRequest, PredictResponse, Prediction, ok, ok_list

router = APIRouter(prefix="/ml", tags=["ml"])


@router.get("/models", response_model=Envelope[list[ModelResponse]])
def list_models(svc: BaselineLeakPredictionService = Depends(get_prediction_service)):
    return ok_list(svc.metadata())


@router.get("/health", response_model=Envelope[ModelHealth])
def ml_health(svc: BaselineLeakPredictionService = Depends(get_prediction_service)):
    return ok(svc.health())


@router.post("/predict", response_model=Envelope[PredictResponse])
def predict(req: PredictRequest, svc: BaselineLeakPredictionService = Depends(get_prediction_service)):
    model, results = svc.predict(req.readings, req.model_name)
    return ok(PredictResponse(model=model, predictions=[Prediction(**r) for r in results], disclaimer=DISCLAIMER))
