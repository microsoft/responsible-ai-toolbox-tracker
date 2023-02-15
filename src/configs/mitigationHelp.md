### Responsible AI Mitigation Library

<details> 
<summary>Encoders</summary>

[Link to Encoders](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/encoder/encoder.html)
The Encoders API allows for ordinal or one-hot encoding of categorical features.

  
  [**Ordinal Encoding**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/encoder/ordinal.html)

  ```py
  classdataprocessing.EncoderOrdinal(df: Optional[Union[DataFrame, ndarray]] = None, col_encode: Optional[list] = None, categories: Union[dict, str] = 'auto', unknown_err: bool = False, unknown_value: Union[int, float] = -1, verbose: bool = True)
  ```

  [**One Hot Encoding**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/encoder/ordinal.html)

  ```py
  classdataprocessing.EncoderOHE(df: Optional[Union[DataFrame, ndarray]] = None, col_encode: Optional[list] = None, drop: bool = True, unknown_err: bool = True, verbose: bool = True
  ```
</details>

<details> 
<summary>Feature Selection</summary>

[Link to Feature Selection](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/feat_sel/feat_sel.html)
The Feature Selection API enables selecting a subset of features that are the most informative for the prediction task.

  
  [**Sequential Feature Selection**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/feat_sel/seq.html)

  ```py
  classdataprocessing.SeqFeatSelection(df: Optional[Union[DataFrame, ndarray]] = None, label_col: Optional[str] = None, X: Optional[Union[DataFrame, ndarray]] = None, y: Optional[Union[DataFrame, ndarray]] = None, transform_pipe: Optional[list] = None, in_place: bool = False, regression: Optional[bool] = None, estimator: Optional[BaseEstimator] = None, n_feat: Union[int, str, tuple] = 'best', fixed_cols: Optional[list] = None, cv: int = 3, scoring: Optional[str] = None, forward: bool = True, save_json: bool = False, json_summary: str = 'seq_feat_summary.json', n_jobs: int = 1, verbose: bool = True)
  ```

  [**Feature Selection via Gradient Boosting**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/feat_sel/catboost.html)

  ```py
  classdataprocessing.CatBoostSelection(df: Optional[Union[DataFrame, ndarray]] = None, label_col: Optional[str] = None, X: Optional[Union[DataFrame, ndarray]] = None, y: Optional[Union[DataFrame, ndarray]] = None, transform_pipe: Optional[list] = None, regression: Optional[bool] = None, estimator: Optional[Union[CatBoostClassifier, CatBoostRegressor]] = None, in_place: bool = False, catboost_log: bool = True, catboost_plot: bool = False, test_size: float = 0.2, cat_col: Optional[list] = None, n_feat: Optional[int] = None, fixed_cols: Optional[list] = None, algorithm: str = 'loss', steps: int = 1, save_json: bool = False, json_summary: str = 'cb_feat_summary.json', verbose: bool = True)
  ```

  [**Feature Selection via Removing Correlated Features**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/feat_sel/correlation.html)

  ```py
  classdataprocessing.CorrelatedFeatures(df: Optional[Union[DataFrame, ndarray]] = None, label_col: Optional[str] = None, X: Optional[Union[DataFrame, ndarray]] = None, y: Optional[Union[DataFrame, ndarray]] = None, transform_pipe: Optional[list] = None, in_place: bool = False, cor_features: Optional[list] = None, method_num_num: list = ['spearman'], num_corr_th: float = 0.85, num_pvalue_th: float = 0.05, method_num_cat: str = 'model', levene_pvalue: float = 0.01, anova_pvalue: float = 0.05, omega_th: float = 0.9, jensen_n_bins: Optional[int] = None, jensen_th: float = 0.8, model_metrics: list = ['f1', 'auc'], metric_th: float = 0.9, method_cat_cat: str = 'cramer', cat_corr_th: float = 0.85, cat_pvalue_th: float = 0.05, tie_method: str = 'missing', save_json: bool = True, json_summary: str = 'summary.json', json_corr: str = 'corr_pairs.json', json_uncorr: str = 'uncorr_pairs.json', compute_exact_matches: bool = True, verbose: bool = True)
  ```
</details>

<details> 
<summary>Imputers</summary>

[Link to Imputers](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/imputer/imputer.html)
The Imputer API enables a simple approach for replacing missing values across several columns with different parameters, simultaneously replacing with the mean, median, most constant, or most frequent value in a dataset.

  
  [**Basic Imputation**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/imputer/basic.html)

  ```py
  classdataprocessing.BasicImputer(df: Optional[Union[DataFrame, ndarray]] = None, col_impute: Optional[list] = None, categorical: Optional[dict] = None, numerical: Optional[dict] = None, specific_col: Optional[dict] = None, verbose: bool = True)
  ```
</details>

<details> 
<summary>Sampling</summary>

[Link to Sampling](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/sampler/sampler.html)
The Sampling API enables data augmentation by rebalancing existing data or synthesizing new data.


  [**Data Rebalance**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/sampler/rebalance.html)

  ```py
  classdataprocessing.Rebalance(df: Optional[Union[DataFrame, ndarray]] = None, rebalance_col: Optional[str] = None, X: Optional[Union[DataFrame, ndarray]] = None, y: Optional[Union[DataFrame, ndarray]] = None, transform_pipe: Optional[list] = None, in_place: bool = False, cat_col: Optional[list] = None, strategy_over: Optional[Union[str, dict, float]] = None, k_neighbors: int = 4, over_sampler: Union[BaseSampler, bool] = True, strategy_under: Optional[Union[str, dict, float]] = None, under_sampler: Union[BaseSampler, bool] = False, n_jobs: int = 1, verbose: bool = True)
  ```

  [**Data Synthesis**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/sampler/synthesizer.html)

  ```py
  classdataprocessing.Synthesizer(df: Optional[DataFrame] = None, label_col: Optional[str] = None, X: Optional[DataFrame] = None, y: Optional[DataFrame] = None, transform_pipe: Optional[list] = None, in_place: bool = False, model: Union[BaseTabularModel, str] = 'ctgan', epochs: int = 50, save_file: Optional[str] = None, load_existing: bool = True, verbose: bool = True)
  ```
</details>

<details> 
<summary>Scalers</summary>

[Link to Scalers](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/scaler.html)
The Scaler API enables applying numerical scaling transformations to several features at the same time.

  
  [**Data Standardization Scaling**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/standard.html)

  ```py
  classdataprocessing.DataStandardScaler(scaler_obj: Optional[StandardScaler] = None, df: Optional[Union[DataFrame, ndarray]] = None, exclude_cols: Optional[list] = None, include_cols: Optional[list] = None, transform_pipe: Optional[list] = None, verbose: bool = True)
  ```

  [**Min Max Scaling**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/minmax.html)

  ```py
  classdataprocessing.DataMinMaxScaler(scaler_obj: Optional[MinMaxScaler] = None, df: Optional[Union[DataFrame, ndarray]] = None, exclude_cols: Optional[list] = None, include_cols: Optional[list] = None, transform_pipe: Optional[list] = None, verbose: bool = True)
  ```

  [**Quantile Transformer Scaling**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/quantile.html)

  ```py
  classdataprocessing.DataQuantileTransformer(scaler_obj: Optional[QuantileTransformer] = None, df: Optional[Union[DataFrame, ndarray]] = None, exclude_cols: Optional[list] = None, include_cols: Optional[list] = None, transform_pipe: Optional[list] = None, verbose: bool = True)
  ```

  [**Power Transformer Scaling**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/power.html)

  ```py
  classdataprocessing.DataPowerTransformer(scaler_obj: Optional[PowerTransformer] = None, df: Optional[Union[DataFrame, ndarray]] = None, exclude_cols: Optional[list] = None, include_cols: Optional[list] = None, transform_pipe: Optional[list] = None, verbose: bool = True)
  ```

  [**Robust Statistics Scaling**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/robust.html)

  ```py
  classdataprocessing.DataRobustScaler(scaler_obj: Optional[RobustScaler] = None, df: Optional[Union[DataFrame, ndarray]] = None, exclude_cols: Optional[list] = None, include_cols: Optional[list] = None, transform_pipe: Optional[list] = None, verbose: bool = True)
  ```

  [**Data Normalization Scaling**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/normalize.html)

  ```py
  classdataprocessing.DataNormalizer(scaler_obj: Optional[Normalizer] = None, df: Optional[Union[DataFrame, ndarray]] = None, exclude_cols: Optional[list] = None, include_cols: Optional[list] = None, transform_pipe: Optional[list] = None, verbose: bool = True)
  ```

  
</details>
