# Data Dictionary

## Pressure
- **Type**: float64
- **Meaning**: Pipeline pressure measurement
- **Current Role**: ML feature
- **Stats**: Range: [27.58732659930927, 99.26237706436326] | Mean: 60.06

## Flow_Rate
- **Type**: float64
- **Meaning**: Water flow rate through the pipeline
- **Current Role**: ML feature
- **Stats**: Range: [21.163996225724865, 132.93582781355727] | Mean: 79.85

## Temperature
- **Type**: float64
- **Meaning**: Temperature of the water or pipeline
- **Current Role**: ML feature
- **Stats**: Range: [83.122104499112, 117.14455239004108] | Mean: 100.05

## Vibration
- **Type**: float64
- **Meaning**: Vibration levels of the pipeline
- **Current Role**: ML feature
- **Stats**: Range: [1.0718123353797016, 5.239542125512879] | Mean: 3.01

## RPM
- **Type**: float64
- **Meaning**: Pump revolutions per minute
- **Current Role**: ML feature
- **Stats**: Range: [903.4740454687684, 3083.405018844701] | Mean: 1994.49

## Operational_Hours
- **Type**: int64
- **Meaning**: Hours of operation of the equipment
- **Current Role**: ML feature
- **Stats**: Range: [1000, 9998] | Mean: 5488.25

## Zone
- **Type**: str
- **Meaning**: Geographical or operational zone
- **Current Role**: Location identifier
- **Stats**: Unique categories: 5

## Block
- **Type**: str
- **Meaning**: Sub-division within a zone
- **Current Role**: Location identifier
- **Stats**: Unique categories: 5

## Pipe
- **Type**: str
- **Meaning**: Specific pipe identifier
- **Current Role**: Location identifier
- **Stats**: Unique categories: 5

## Location_Code
- **Type**: str
- **Meaning**: Unique code for the location
- **Current Role**: Location identifier
- **Stats**: Unique categories: 125

## Latitude
- **Type**: float64
- **Meaning**: Geographical latitude
- **Current Role**: Location identifier
- **Stats**: Range: [25.081388808371816, 25.291945353486263] | Mean: 25.18

## Longitude
- **Type**: float64
- **Meaning**: Geographical longitude
- **Current Role**: Location identifier
- **Stats**: Range: [55.14601515815271, 55.31281728311812] | Mean: 55.25

## Leakage_Flag
- **Type**: int64
- **Meaning**: Indicator if leakage occurred (1) or not (0)
- **Current Role**: Target variable
- **Stats**: Balance: 0 (4677), 1 (323)

