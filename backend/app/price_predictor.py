import hashlib
import random
import time
import math
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import root_mean_squared_error
from typing import Optional, List, Dict, Tuple
from .models import ProductResult, PricePrediction, ActionEnum, PlatformType, PriceOracleResponse, DataPoint
from .data_engine import price_cache

def generate_historical_price_points(product: ProductResult, days: int = 30) -> List[Dict]:
    """Generate time-series historical price data for live product linear regression forecasting."""
    seed_val = int(hashlib.md5(product.title.encode('utf-8')).hexdigest(), 16)
    rng = random.Random(seed_val)
    
    current_price = product.price_breakdown.total_landed_cost
    if current_price == 0: return []
    
    history = []
    now = int(time.time())
    
    # Simulate a price trend (e.g. slowly dropping, or volatile)
    trend = rng.choice(["down", "up", "volatile", "stable"])
    base_price = current_price
    
    # Work backwards in time
    for i in range(days, 0, -1):
        timestamp = now - (i * 86400) # days ago
        
        if trend == "down":
            # Price was higher in the past
            price = base_price * (1 + (i * 0.01)) * rng.uniform(0.98, 1.02)
        elif trend == "up":
            # Price was lower in the past
            price = base_price * (1 - (i * 0.01)) * rng.uniform(0.98, 1.02)
        elif trend == "volatile":
            price = base_price * rng.uniform(0.85, 1.15)
        else:
            price = base_price * rng.uniform(0.98, 1.02)
            
        history.append({
            "timestamp": timestamp,
            "price": round(price, 2)
        })
        
    return history

def predict_future_price(product: ProductResult) -> PricePrediction:
    # 1. Fetch real historical data from cache if exists
    history = price_cache.get_history(product.id)
    
    if not history or len(history) < 5:
        # Fallback to calculated price trend
        history = generate_historical_price_points(product, 30)
        
    # 2. Prepare Data for Scikit-Learn
    # X = days since start, Y = price
    start_time = history[0]["timestamp"]
    
    X_train = np.array([[(h["timestamp"] - start_time) / 86400] for h in history])
    y_train = np.array([h["price"] for h in history])
    
    # 3. Train Linear Regression Model
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    # 4. Calculate RMSE on training data
    y_pred = model.predict(X_train)
    rmse = root_mean_squared_error(y_train, y_pred)
    
    # 5. Forecast next 7 days
    future_days = 7
    last_day = X_train[-1][0]
    X_future = np.array([[last_day + i] for i in range(1, future_days + 1)])
    y_future = model.predict(X_future)
    
    # 6. Build Chart Data
    chart_data = []
    for h in history:
        chart_data.append(DataPoint(timestamp=h["timestamp"], price=h["price"], is_forecast=False))
        
    now = int(time.time())
    for i in range(future_days):
        forecast_time = now + ((i+1) * 86400)
        chart_data.append(DataPoint(timestamp=forecast_time, price=round(y_future[i], 0), is_forecast=True))
        
    # 7. Formulate Recommendation
    slope = model.coef_[0]
    forecast_end_price = y_future[-1]
    current_price = product.price_breakdown.total_landed_cost
    
    if slope < -2.0: # Price dropping significantly
        action = ActionEnum.WAIT
        reason = f"ML Forecast: Price dropping by ₹{abs(slope):.0f}/day. Wait {future_days} days."
        confidence = min(95, int(90 - (rmse / current_price * 100))) # Higher RMSE = lower confidence
        savings = max(0, current_price - forecast_end_price)
    elif slope > 2.0: # Price rising
        action = ActionEnum.BUY_NOW
        reason = f"ML Forecast: Price is trending UP. Buy now to avoid paying more."
        confidence = min(95, int(90 - (rmse / current_price * 100)))
        savings = 0
    else:
        # Stable
        avg_price = np.mean(y_train)
        if current_price < avg_price * 0.95:
            action = ActionEnum.BUY_NOW
            reason = "Price is stable but currently below historical average. Good time to buy."
            savings = 0
            confidence = 85
        else:
            action = ActionEnum.WAIT
            reason = "Price is stable but slightly high. A flash sale might occur soon."
            savings = round(current_price - avg_price, 0)
            confidence = 80
            
    prediction = PricePrediction(
        action=action,
        confidence=confidence,
        reason=reason,
        potential_savings=round(savings, 0)
    )
    
    return prediction

def predict_price_oracle(product: ProductResult) -> Optional[PriceOracleResponse]:
    current_price = product.price_breakdown.total_landed_cost
    if current_price == 0: return None
    
    # 1. Get History
    history = price_cache.get_price_history(product.id)
    if len(history) < 30:
        history = generate_historical_price_points(product, 30)
        
    # 2. Prepare Data for Scikit-Learn
    # X = days since start, Y = price
    start_time = history[0]["timestamp"]
    
    X_train = np.array([[(h["timestamp"] - start_time) / 86400] for h in history])
    y_train = np.array([h["price"] for h in history])
    
    # 3. Train Linear Regression Model
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    # 4. Calculate RMSE on training data
    y_pred = model.predict(X_train)
    rmse = root_mean_squared_error(y_train, y_pred)
    
    # 5. Forecast next 7 days
    future_days = 7
    last_day = X_train[-1][0]
    X_future = np.array([[last_day + i] for i in range(1, future_days + 1)])
    y_future = model.predict(X_future)
    
    # 6. Build Chart Data
    chart_data = []
    for h in history:
        chart_data.append(DataPoint(timestamp=h["timestamp"], price=h["price"], is_forecast=False))
        
    now = int(time.time())
    for i in range(future_days):
        forecast_time = now + ((i+1) * 86400)
        chart_data.append(DataPoint(timestamp=forecast_time, price=round(y_future[i], 0), is_forecast=True))
        
    # 7. Formulate Recommendation
    slope = model.coef_[0]
    forecast_end_price = y_future[-1]
    
    if slope < -2.0: # Price dropping significantly
        action = ActionEnum.WAIT
        reason = f"ML Forecast: Price dropping by ₹{abs(slope):.0f}/day. Wait {future_days} days."
        confidence = min(95, int(90 - (rmse / current_price * 100))) # Higher RMSE = lower confidence
        savings = max(0, current_price - forecast_end_price)
    elif slope > 2.0: # Price rising
        action = ActionEnum.BUY_NOW
        reason = f"ML Forecast: Price is trending UP. Buy now to avoid paying more."
        confidence = min(95, int(90 - (rmse / current_price * 100)))
        savings = 0
    else:
        # Stable
        avg_price = np.mean(y_train)
        if current_price < avg_price * 0.95:
            action = ActionEnum.BUY_NOW
            reason = "Price is stable but currently below historical average. Good time to buy."
            savings = 0
            confidence = 85
        else:
            action = ActionEnum.WAIT
            reason = "Price is stable but slightly high. A flash sale might occur soon."
            savings = round(current_price - avg_price, 0)
            confidence = 80
            
    prediction = PricePrediction(
        action=action,
        confidence=confidence,
        reason=reason,
        potential_savings=round(savings, 0)
    )
    
    return PriceOracleResponse(
        product_id=product.id,
        current_price=current_price,
        prediction=prediction,
        chart_data=chart_data,
        rmse=round(rmse, 2)
    )

def predict_price_action(product: ProductResult) -> Optional[PricePrediction]:
    """Legacy wrapper for backward compatibility."""
    oracle_res = predict_price_oracle(product)
    if oracle_res:
        return oracle_res.prediction
    return None
