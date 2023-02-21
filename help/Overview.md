# Video of Error Mitigations

<img src="C:/Test/AIMitigations.png" alt="AI Mitigations logo" width="50%"/>

[<img src="https://i.ytimg.com/vi/Hc79sDi3f0U/maxresdefault.jpg" width="50%">](https://www.youtube.com/watch?v=Hc79sDi3f0U "Now in Android: 55")




# Error Mitigations

Responsible-AI-Widgets provides a collection of model and data exploration and assessment user interfaces that enable a better understanding of AI systems. One of these interfaces is Error Mitigations (+ Interpretability) dashboard.

You can use the Error Mitigations dashboard to

1. **_Identify_** cohorts with high error rate versus benchmark and visualize how the error rate is distributed.
2. **_Diagnose_** the root causes of the errors by visually diving deeper into the characteristics of data and models (via its embedded interpretability capabilities).

For instance, you can use Error Mitigations to discover that the model has a higher error rate for a specific cohort (e.g., females with income <$50K) vs. the rest of the population. Via its embedded interpretability capabilities of this dashboard, you can next understand the most impactful factors responsible for this subset’s erroneous predictions, inspect some individual records of that cohort receiving erroneous predictions, understand their feature importance values, and perform what-if Mitigations on them to diagnose the contributing error factors better.

## Example Notebooks


## Error Mitigations Dashboard

Error Mitigations drives deeper to provide a better understanding of your machine learning model's behaviors. Use Error Mitigations to identify cohorts with higher error rates and diagnose the root causes behind these errors. Combined with [Fairlearn](github.com/fairlearn/fairlearn) and [Interpret-Community](https://github.com/interpretml/interpret-community), practitioners can perform a wide variety of assessment operations to build responsible machine learning. Use this dashboard to:

1. Evaluate Cohorts: Learn how errors distribute across different cohorts at different levels of granularity
2. Explore Predictions: Use built-in interpretability features or combine with InterpretML for boosted debugging capability
3. Interactive Dashboard View customizable pre-built visuals to quickly identify errors and diagnose root causes

Run the dashboard via:

```python

```

Once you load the visualization dashboard, you can investigate different aspects of your dataset and trained model via two stages:

- Identification
- Diagnosis

---

**NOTE**

Click on "Open in a new tab" on the top left corner to get a better view of the dashboard in a new tab.

---

### Identification of Errors

Error Mitigations identifies cohorts of data with higher error rate than the overall benchmark. These discrepancies might occur when the system or model underperforms for specific demographic groups or infrequently observed input conditions in the training data.

#### Different Methods for Error Identification

1. Error Heatmap: Once you form hypotheses of the most impactful features for failure, use the Error Heatmap to further investigate how one or two input features impact the error rate across cohorts. ![Error Mitigations heat map](./img/EA-Heatmap.png)

### Diagnosis of Errors

After identifying cohorts with higher error rates, Error Mitigations enables debugging and exploring these cohorts further. Gain deeper insights about the model or the data through data exploration and model explanation. Different Methods for Error Diagnosis:

1. Data Exploration which explores dataset statistics and feature distributions. Compare cohort data stats with other cohorts or to benchmark data. Investigate whether certain cohorts are underrepresented or if their feature distribution is significantly different from the overall data.

2. Global Explanation which explore the top K important features that impact the overall model global explanation for a selected cohort of data. Understand how values of features impact model prediction. Compare explanations with those from other cohorts or benchmark.

3. Local Explanation which enables observing the raw data in the Instance View. Understand how each data point has correct or incorrect prediction. Visually identify any missing features or label noise that could lead to issues. Explore local feature importance values (local explanation) and individual conditional expectation (ICE) plots.

4. What-if Mitigations (Perturbation Exploration) which applies changes to feature values of selected data point and observe resulting changes to the prediction.

<a name="supported models"></a>

## Supported Models


If a pipeline script is provided, the explanation function assumes that the running pipeline script returns a prediction. The repository also supports models trained via **PyTorch**, **TensorFlow**, and **Keras** deep learning frameworks.

<a name="getting started"></a>


## Library Support

The application currently supports the following Libaries:

- TensorFlow
- PyTorch
- Theano
- NumPy
- Pandas
- Scikit-Learn
- SciPy


## Getting Started

This repository uses Anaconda to simplify package and environment management.

To setup on your local machine:

<details><summary><strong><em>Install Python module, packages and necessary distributions</em></strong></summary>

```
pip install 
```

If you intend to run repository tests:

```
pip install -r requirements.txt
```

</details>

<details>
<summary><strong><em>Set up and run Jupyter Notebook server </em></strong></summary>

Install and run Jupyter Notebook

```
if needed:
          pip install jupyter
then:
jupyter notebook
```

</details>

## How to 

<details><summary><strong><em>1. How to Register</em></strong></summary>

```
pip install 
```

If you intend to run repository tests:

```
pip install -r requirements.txt
```

</details>

<details><summary><strong><em>2.  How to create new Notebooks</em></strong></summary>

```
pip install 
```

If you intend to run repository tests:

```
pip install -r requirements.txt
```

</details>

<details><summary><strong><em>3. How to compare cohorts</em></strong></summary>

```
pip install 
```

If you intend to run repository tests:

```
pip install -r requirements.txt
```

</details>

<details><summary><strong><em>4.  Creating Mitigations</em></strong></summary>

```
pip install 
```

If you intend to run repository tests:

```
pip install -r requirements.txt
```

</details>


<details><summary><strong><em>5.  How to create group</em></strong></summary>

```
pip install 
```

If you intend to run repository tests:

```
pip install -r requirements.txt
```

</details>


### Responsible AI dashboard Customization

The Responsible AI Toolbox’s strength lies in its customizability. It empowers users to design tailored, end-to-end model debugging and decision-making workflows that address their particular needs. Need some inspiration? Here are some examples of how Toolbox components can be put together to analyze scenarios in different ways:
 
| Responsible AI Dashboard Flow| Use Case  |
|--|--|
| Model Overview -> Error Analysis -> Data Explorer | To identify model errors and diagnose them by understanding the underlying data distribution
| Model Overview -> Error Analysis -> Counterfactuals Analysis and What-If | To diagnose errors in individual instances with counterfactual analysis (minimum change to lead to a different model prediction)
| Model Overview -> Data Explorer -> Data Balance | To understand the root cause of errors and fairness issues introduced via data imbalances or lack of representation of a particular data cohort
 | Model Overview -> Interpretability | To diagnose model errors through understanding how the model has made its predictions
 | Data Explorer -> Causal Inference | To distinguish between correlations and causations in the data or decide the best treatments to apply to see a positive outcome
  | Interpretability -> Causal Inference | To learn whether the factors that model has used for decision making has any causal effect on the real-world outcome.
 | Data Explorer -> Counterfactuals Analysis and What-If | To address customer questions about what they can do next time to get a different outcome from an AI.
  | Data Explorer -> Data Balance | To gain an overall understanding of the data, identify features receiving the positive outcome more than others, and visualize feature distributions


### Useful Links

## Maintainers

- [Besmira Nushi ](Besmira.Nushi@microsoft.com>)