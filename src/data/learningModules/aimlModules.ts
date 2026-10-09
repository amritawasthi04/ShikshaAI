import { DetailedLessonModule } from "./types";

export const aimlModules: Record<string, DetailedLessonModule> = {
  // Phase 1.1: Matrix Multiplications & Eigenvectors (Featured in User Screenshots!)
  "matrix_multiplications_eigenvectors": {
    topicId: "aiml_1_1",
    title: "Matrix Multiplications & Eigenvectors",
    subtitle: "Geometric intuition of vector spaces, transformation matrices, and PCA.",
    domain: "Machine Learning & AI",
    phaseName: "Foundation",
    duration: "40m",
    type: "concept",
    keyObjectives: [
      "Understand linear transformations as geometric space deformations and matrix multiplication as composite functions.",
      "Derive the characteristic equation det(A - λI) = 0 to calculate eigenvalues λ and invariant directional eigenvectors v.",
      "Apply eigendecomposition to covariance matrices for Principal Component Analysis (PCA) dimensionality reduction.",
      "Implement numerical linear algebra routines in NumPy/Python with np.linalg.eigh avoiding floating-point drift and dimensional mismatch.",
    ],
    deepDive: {
      overview:
        "Linear algebra is the foundational mathematical language of machine learning and modern neural networks. At its core, a matrix is not merely a 2D grid of numbers—it represents a linear geometric transformation that stretches, rotates, shears, or inverts space. When two matrices multiply, they compose two successive transformations into a single compact operator. Within any square transformation matrix A, certain special directional vectors remain invariant under the transformation: they do not change direction, but are merely scaled by a scalar factor λ. These are eigenvectors, and λ is their eigenvalue.",
      mentalModel:
        "Imagine stretching a circular rubber sheet in 2D space. As you stretch it into an ellipse, almost every vector drawn from the origin changes its spatial angle. However, the vectors lying along the major and minor axes of the ellipse maintain their exact pointing direction—they only stretch or shrink. Those invariant directional axes are the eigenvectors, and the stretch factors along those axes are the eigenvalues.",
      coreConcepts: [
        {
          title: "Linear Transformations & Basis Change",
          description:
            "A matrix A transforms an input vector x via T(x) = Ax. The columns of matrix A describe where the standard unit basis vectors (e₁, e₂, ...) land after the transformation. Matrix multiplication AB represents executing transformation B followed by transformation A.",
          highlight: "Matrix multiplication is associative A(BC) = (AB)C but non-commutative (AB ≠ BA).",
        },
        {
          title: "The Characteristic Eigenvalue Equation",
          description:
            "The equation Av = λv defines an eigenvector v and eigenvalue λ. Rearranging yields (A - λI)v = 0. For non-trivial solutions (v ≠ 0), the matrix (A - λI) must be singular, requiring det(A - λI) = 0. Solving this characteristic polynomial yields the eigenvalues.",
          highlight: "det(A - λI) = 0 yields the characteristic roots that quantify dimensional scaling.",
        },
        {
          title: "Spectral Theorem & Covariance Decomposition",
          description:
            "For symmetric real matrices (such as feature covariance matrices Σ = XᵀX / (N-1)), all eigenvalues are guaranteed to be real, and eigenvectors are orthogonal. Eigendecomposition factorizes the matrix into Σ = Q Λ Qᵀ, where Q is an orthogonal matrix of eigenvectors and Λ is a diagonal matrix of eigenvalues.",
          highlight: "Symmetric covariance matrices always decompose into strictly orthogonal basis vectors.",
        },
        {
          title: "PCA: Dimensionality Reduction via Top Eigenvectors",
          description:
            "Principal Component Analysis identifies the axes of maximum variance in high-dimensional data. By calculating the covariance matrix of mean-centered data and sorting eigenvectors in descending order of their eigenvalues, we project data onto the top-k eigenvectors, retaining maximum statistical information while compressing dimensionality.",
          highlight: "The largest eigenvalue corresponds to the direction of highest empirical data spread.",
        },
      ],
      pitfalls: [
        "Neglecting Mean-Centering: Calculating sample covariance without subtracting feature means introduces severe origin shift bias.",
        "Using np.linalg.eig instead of np.linalg.eigh: For symmetric matrices like covariance, eigh is faster, numerically stable, and guarantees real eigenvalues.",
        "Matrix Shape Mismatch: Multiplying (M × K) with (N × P) fails if K ≠ N. Always verify inner dimensional agreement before executing @ operator.",
      ],
      realWorldApplications:
        "Eigendecomposition powers Google PageRank (finding the dominant eigenvector of a web transition stochastic matrix), Computer Vision (Eigenfaces for facial recognition), Recommendation Systems (Singular Value Decomposition), and Deep Learning Parameter-Efficient Fine-Tuning (LoRA weight decomposition).",
    },
    codeBlueprint: {
      language: "python",
      languageBadge: "Python 3.12 • NumPy",
      filename: "eigen_pca_transform.py",
      code: `import numpy as np

def compute_eigendecomposition_and_pca(
    X: np.ndarray, 
    n_components: int = 2
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Computes spectral eigendecomposition of a feature covariance matrix
    and projects the high-dimensional data onto principal component axes.
    
    Parameters:
        X: Feature matrix of shape (n_samples, n_features)
        n_components: Number of dominant principal components to retain
        
    Returns:
        projected_data: Reduced data of shape (n_samples, n_components)
        sorted_eigenvalues: Eigenvalues sorted descending
        top_eigenvectors: Orthonormal projection matrix (n_features, n_components)
        variance_ratio: Percentage of total variance captured per component
    """
    # 1. Step 1: Mean-center the feature matrix along feature columns
    mean_vector = np.mean(X, axis=0)
    X_centered = X - mean_vector
    n_samples, n_features = X.shape

    # 2. Step 2: Calculate unbiased sample covariance matrix: Cov = (X^T @ X) / (N - 1)
    cov_matrix = np.dot(X_centered.T, X_centered) / (n_samples - 1)

    # 3. Step 3: Compute eigenvalues & eigenvectors for symmetric covariance matrix
    # eigh is numerically stable for symmetric/Hermitian matrices
    eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)

    # 4. Step 4: Sort eigenvalues and corresponding eigenvectors in descending order
    descending_order = np.argsort(eigenvalues)[::-1]
    sorted_eigenvalues = eigenvalues[descending_order]
    sorted_eigenvectors = eigenvectors[:, descending_order]

    # 5. Step 5: Select top-k eigenvectors as the projection basis matrix W
    top_eigenvectors = sorted_eigenvectors[:, :n_components]

    # 6. Step 6: Project centered data onto lower-dimensional eigenspace
    projected_data = np.dot(X_centered, top_eigenvectors)

    # 7. Step 7: Compute explained variance ratio
    total_variance = np.sum(sorted_eigenvalues)
    variance_ratio = sorted_eigenvalues[:n_components] / total_variance

    return projected_data, sorted_eigenvalues, top_eigenvectors, variance_ratio


if __name__ == "__main__":
    np.random.seed(42)
    # Generate 150 samples with 3 features and high correlation
    cov_true = np.array([[4.0, 2.5, 0.5],
                         [2.5, 3.0, 1.2],
                         [0.5, 1.2, 2.0]])
    raw_data = np.random.multivariate_normal(mean=[10, 20, 30], cov=cov_true, size=150)
    
    projected, lambdas, eigenvectors, var_ratio = compute_eigendecomposition_and_pca(raw_data, n_components=2)
    
    print("=== Shiksha Linear Algebra Eigendecomposition Output ===")
    print(f"Original Data Shape:    {raw_data.shape}")
    print(f"Projected Data Shape:   {projected.shape}")
    print(f"Top 2 Eigenvalues:      {np.round(lambdas[:2], 4)}")
    print(f"Explained Variance:     {np.round(var_ratio * 100, 2)}% (Cumulative: {np.round(np.sum(var_ratio) * 100, 2)}%)")`,
      explanation:
        "This implementation demonstrates complete eigendecomposition-driven PCA. We center raw feature columns, construct the sample covariance matrix, compute real eigenvalues with np.linalg.eigh, order the orthogonal eigenvectors by descending variance, and project high-dimensional data onto the principal orthogonal subspace.",
      architectureFlow:
        "Input Data (N × D) ──► Mean Centering (X - μ) ──► Covariance Matrix Σ = (XᵀX)/(N-1) ──► np.linalg.eigh ──► Sort (λᵢ, vᵢ) Descending ──► Top-K Projection Matrix W ──► Projected Data (N × K)",
    },
    quizQuestions: [
      {
        question: "What geometrically defines an eigenvector v of a linear transformation matrix A?",
        options: [
          "It is rotated by exactly 90 degrees relative to its original span.",
          "Its direction remains invariant; it is only scaled by scalar eigenvalue λ (Av = λv).",
          "It is always collapsed to zero length in the kernel subspace.",
          "It has a unit length of exactly 1 before and after any arbitrary transformation.",
        ],
        correctIndex: 1,
        explanation:
          "By definition, Av = λv. The linear transformation matrix A acts on eigenvector v by scaling its magnitude by λ without changing the span of its direction vector.",
      },
      {
        question: "Why is it mandatory to mean-center dataset features before calculating the covariance matrix for PCA?",
        options: [
          "Without mean-centering, the first principal component aligns with the data mean rather than the axis of maximum variance.",
          "NumPy's np.linalg.eigh will throw a dimensional division error on non-zero means.",
          "Mean-centering forces all eigenvalues to equal 1.0.",
          "To convert negative matrix values into positive integers.",
        ],
        correctIndex: 0,
        explanation:
          "If the data is not centered, the first component will point toward the center of mass of the data rather than capturing the genuine variance and spread among features.",
      },
    ],
    resources: [
      {
        title: "3Blue1Brown: Essence of Linear Algebra (Eigenvectors & Eigenvalues)",
        url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
        type: "video",
        description: "The gold-standard visual geometric explanation of vector spaces, determinants, and eigenvectors.",
        sourceLabel: "3Blue1Brown",
      },
      {
        title: "NumPy Documentation: np.linalg.eigh Routine Reference",
        url: "https://numpy.org/doc/stable/reference/generated/numpy.linalg.eigh.html",
        type: "documentation",
        description: "Official guide on computing eigenvalues and eigenvectors of real symmetric matrices.",
        sourceLabel: "NumPy.org",
      },
      {
        title: "Immersive Linear Algebra: Interactive Geometric Eigenvector Visualizer",
        url: "https://immersivemath.com/ila/ch09_eigen/ch09.html",
        type: "article",
        description: "Interactive browser 3D tool allowing you to drag vectors and watch eigenvector alignment.",
        sourceLabel: "ImmersiveMath",
      },
      {
        title: "Scikit-Learn: Mathematical Formulation of Principal Component Analysis",
        url: "https://scikit-learn.org/stable/modules/decomposition.html#pca",
        type: "documentation",
        description: "Production implementation details of SVD, covariance eigendecomposition, and incremental PCA.",
        sourceLabel: "Scikit-Learn",
      },
    ],
    practicalChallenge: {
      prompt:
        "Modify the function to reconstruct the original data matrix from the top-2 principal components (Inverse PCA Transform) using X_reconstructed = (projected @ W.T) + mean_vector, and measure the reconstruction Mean Squared Error (MSE).",
      starterHint: "Remember to add the mean_vector back after multiplying projected with W.T.",
      expectedOutput: "Reconstruction MSE should be strictly less than the variance of the discarded 3rd component.",
    },
  },

  // Phase 1.2: NumPy Vectorized Operations & Broadcasting
  "numpy_vectorized_operations_broadcasting": {
    topicId: "aiml_1_2",
    title: "NumPy Vectorized Operations & Broadcasting",
    subtitle: "Eliminate Python loops with C-backed contiguous memory tensors and SIMD instructions.",
    domain: "Machine Learning & AI",
    phaseName: "Foundation",
    duration: "45m",
    type: "exercise",
    keyObjectives: [
      "Master the mechanics of contiguous memory strides and ndarray C-contiguous memory layout.",
      "Apply NumPy broadcasting rules across differing tensor dimensions without copying memory in RAM.",
      "Eliminate slow interpreted Python for-loops using vectorized universal functions (ufuncs).",
      "Benchmark memory usage and cache-locality benefits using strided operations and np.einsum.",
    ],
    deepDive: {
      overview:
        "Python lists store pointers to heap-allocated objects, causing massive cache misses and interpreter overhead during iteration. NumPy ndarrays store raw, homogeneous, contiguous memory buffers operated on by optimized C and Fortran routines with CPU SIMD vector registers. Broadcasting allows NumPy to execute element-wise operations on arrays of differing shapes by virtually stretching trailing dimensions with zero memory duplication.",
      mentalModel:
        "Think of a Python list as a box containing address slips pointing to items scattered across a giant warehouse. In contrast, a NumPy array is a conveyor belt of items packed tightly side-by-side. A vectorized operation is an automated assembly line that stamps 8 or 16 items simultaneously using SIMD CPU instructions.",
      coreConcepts: [
        {
          title: "Memory Strides & Contiguity",
          description:
            "An ndarray is defined by a data pointer, a data type, a shape tuple, and a strides tuple. Strides indicate how many bytes to step in memory to advance by one index in each dimension. Transposing an array merely updates its strides metadata without copying data.",
          highlight: "Transposes and slices create views with modified strides, avoiding costly memory allocations.",
        },
        {
          title: "The Two Rules of NumPy Broadcasting",
          description:
            "When operating on two arrays, NumPy compares their shapes element-wise from right to left (trailing dimensions first). Two dimensions are compatible if: (1) they are equal, or (2) one of them is 1. If an array has fewer dimensions, its shape is prepended with 1s.",
          highlight: "Arrays of shape (M, 1) and (1, N) automatically broadcast to a combined (M, N) matrix.",
        },
      ],
      pitfalls: [
        "Unintentional Outer Products: Subtracting a 1D array of shape (N,) from a 2D column vector (N, 1) without explicit matching broadcasts into an (N, N) matrix instead of an (N,) vector.",
        "Modifying Shared Array Views: Creating a slice b = a[:5] returns a view; modifying b will silently mutate the original array a unless .copy() is invoked.",
      ],
      realWorldApplications:
        "Vectorized batch operations form the backbone of neural network loss functions, image processing filtering kernels, Monte Carlo simulation batches, and algorithmic trading backtesting.",
    },
    codeBlueprint: {
      language: "python",
      languageBadge: "Python 3.12 • NumPy",
      filename: "vectorized_broadcasting.py",
      code: `import numpy as np
import time

def vectorized_pairwise_euclidean_distance(X: np.ndarray, Y: np.ndarray) -> np.ndarray:
    """
    Computes all pairwise Euclidean distances between vectors in X and Y
    using NumPy broadcasting without any nested Python loops.
    
    Shapes:
        X: (N, D)
        Y: (M, D)
    Returns:
        Distance Matrix: (N, M) where dist[i, j] = ||X[i] - Y[j]||
    """
    # Reshape X to (N, 1, D) and Y to (1, M, D)
    # Broadcasting expands both to (N, M, D) across virtual memory strides
    diff = X[:, np.newaxis, :] - Y[np.newaxis, :, :]
    
    # Square differences, sum across feature dimension D, and compute sqrt
    distances = np.sqrt(np.sum(diff ** 2, axis=-1))
    return distances

if __name__ == "__main__":
    np.random.seed(42)
    N, M, D = 1000, 500, 64
    features_a = np.random.randn(N, D)
    features_b = np.random.randn(M, D)

    start = time.perf_counter()
    dist_matrix = vectorized_pairwise_euclidean_distance(features_a, features_b)
    elapsed = (time.perf_counter() - start) * 1000

    print(f"Computed {N}x{M} pairwise distances in {elapsed:.2f} ms")
    print(f"Output Matrix Shape: {dist_matrix.shape}")`,
      explanation:
        "By introducing np.newaxis to X and Y, we expand their shapes to (N, 1, D) and (1, M, D). NumPy automatically broadcasts the subtraction to (N, M, D) and calculates the full Euclidean distance matrix in parallel C loops.",
      architectureFlow:
        "X (N, D) ──► (N, 1, D) ─┐\n                         ├──► Broadcast Subtraction (N, M, D) ──► Sum along axis -1 ──► Sqrt ──► Distance Matrix (N, M)\nY (M, D) ──► (1, M, D) ─┘",
    },
    quizQuestions: [
      {
        question: "Under NumPy broadcasting rules, can an array of shape (256, 256, 3) operate directly with an array of shape (3,)?",
        options: [
          "Yes, because trailing dimension 3 matches, and missing dimensions are prepended with 1s.",
          "No, both arrays must have identical dimensional rank.",
          "No, the second array must be reshaped to (1, 1, 1).",
          "Yes, but only if both arrays contain floating point values.",
        ],
        correctIndex: 0,
        explanation:
          "NumPy prepends dimensions with 1, making (3,) into (1, 1, 3), which cleanly broadcasts across (256, 256, 3).",
      },
    ],
    resources: [
      {
        title: "NumPy Official Guide: Array Broadcasting Mechanics",
        url: "https://numpy.org/doc/stable/user/basics.broadcasting.html",
        type: "documentation",
        description: "Comprehensive visual documentation on broadcasting dimensions and memory strides.",
      },
    ],
  },

  // Phase 1.3: Data Cleaning & Feature Engineering with Pandas
  "data_cleaning_feature_engineering_pandas": {
    topicId: "aiml_1_3",
    title: "Data Cleaning & Feature Engineering with Pandas",
    subtitle: "Handle missing values, categorical encoding, outliers, and feature scaling.",
    domain: "Machine Learning & AI",
    phaseName: "Foundation",
    duration: "40m",
    type: "exercise",
    keyObjectives: [
      "Implement robust missing data imputation strategies (median, iterative, indicator masks).",
      "Apply appropriate categorical encodings (One-Hot, Target Encoding, Ordinal) avoiding data leakage.",
      "Detect and transform skewed distributions using log transforms and power transformers.",
      "Construct leak-free preprocessing pipelines utilizing scikit-learn transformers and Pandas.",
    ],
    deepDive: {
      overview:
        "Garbage in, garbage out is the cardinal law of machine learning. Raw real-world data contains corrupted strings, missing observations, skewed distributions, and categorical labels. Feature engineering transforms unstructured messy data into a clean numerical representation tailored to statistical estimators.",
      mentalModel:
        "Think of raw data as rough timber freshly felled from the forest. Feature engineering is the sawmill that planes the wood, strips the bark, cuts standardized planks, and seasons the lumber so an architect can build a sturdy house without structural collapse.",
      coreConcepts: [
        {
          title: "Preventing Data Leakage",
          description:
            "Preprocessing parameters (mean, standard deviation, target encoding priors) must be computed exclusively on the training set and applied downstream to validation/test folds.",
          highlight: "Never fit scalers or imputers on the entire dataset before train/test splitting.",
        },
      ],
      pitfalls: [
        "Applying fit_transform on Test Sets: Test sets must only undergo .transform() using statistics learned from training data.",
      ],
      realWorldApplications:
        "Every production ML pipeline from credit scoring to fraud detection relies on validated preprocessing pipelines.",
    },
    codeBlueprint: {
      language: "python",
      languageBadge: "Python 3.12 • Pandas & Scikit-Learn",
      filename: "feature_pipeline.py",
      code: `import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

def build_production_preprocessor(numeric_features: list[str], categorical_features: list[str]):
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value="missing")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    
    return ColumnTransformer(transformers=[
        ("num", numeric_transformer, numeric_features),
        ("cat", categorical_transformer, categorical_features)
    ])`,
      explanation:
        "Uses ColumnTransformer to build a leak-free preprocessing pipeline handling both continuous numerical and discrete categorical columns.",
    },
    quizQuestions: [
      {
        question: "Why should StandardScaler be fitted strictly on the training partition rather than the full dataset?",
        options: [
          "Fitting on the whole dataset introduces data leakage, distorting real-world generalization evaluation.",
          "StandardScaler will throw an exception on test datasets.",
          "It accelerates training runtime by 50%.",
          "Test sets have zero variance.",
        ],
        correctIndex: 0,
        explanation:
          "Fitting scalers on test data exposes the test distribution to the model, giving unrealistically optimistic performance metrics that fail in production.",
      },
    ],
    resources: [
      {
        title: "Scikit-Learn Guide on Preprocessing Pipelines",
        url: "https://scikit-learn.org/stable/modules/preprocessing.html",
        type: "documentation",
        description: "Official guide to transformers, imputers, and ColumnTransformer.",
      },
    ],
  },

  // Phase 2.1: Gradient Descent Optimization & Cost Functions
  "gradient_descent_optimization_cost_functions": {
    topicId: "aiml_2_1",
    title: "Gradient Descent Optimization & Cost Functions",
    subtitle: "Batch, stochastic, and mini-batch convergence, momentum, and adaptive learning rates.",
    domain: "Machine Learning & AI",
    phaseName: "Core Skills",
    duration: "45m",
    type: "concept",
    keyObjectives: [
      "Understand the multivariable calculus gradient vector ∇L as the direction of steepest loss ascent.",
      "Compare Batch Gradient Descent, Stochastic Gradient Descent (SGD), and Mini-Batch SGD trade-offs.",
      "Analyze modern adaptive optimizers: Momentum, RMSProp, Adam, and AdamW weight decay.",
      "Diagnose exploding and vanishing gradients using learning rate schedules and gradient clipping.",
    ],
    deepDive: {
      overview:
        "Optimization algorithms are the search engines that train machine learning models. By computing the partial derivatives of a scalar loss function with respect to every learnable parameter (the gradient ∇L), gradient descent steps parameters in the opposite direction (-η∇L) to minimize the cost surface.",
      mentalModel:
        "Imagine you are blindfolded on a foggy mountain in a rainstorm and you want to reach the lowest valley. At each step, you feel the slope of the ground with your feet and step downward. The slope is the gradient, your step size is the learning rate, and momentum prevents you from getting trapped in shallow puddles.",
      coreConcepts: [
        {
          title: "AdamW: Decoupled Weight Decay",
          description:
            "Standard Adam applies L2 regularization to the gradient, which distorts the moving averages. AdamW decouples weight decay directly from gradient updates, restoring proper regularization.",
          highlight: "AdamW is the default standard optimizer for modern transformer and LLM training.",
        },
      ],
      pitfalls: [
        "Setting learning rate too high, causing loss divergence to NaN.",
      ],
      realWorldApplications:
        "Used universally across deep neural networks, vision transformers, and large language models.",
    },
    codeBlueprint: {
      language: "python",
      languageBadge: "Python 3.12 • PyTorch / NumPy",
      filename: "adamw_optimizer.py",
      code: `import numpy as np

def update_adamw(params, grads, m, v, t, lr=1e-3, beta1=0.9, beta2=0.999, eps=1e-8, weight_decay=1e-2):
    """
    Executes a single step of AdamW optimization with decoupled weight decay.
    """
    # 1. Update biased 1st and 2nd moment estimates
    m = beta1 * m + (1 - beta1) * grads
    v = beta2 * v + (1 - beta2) * (grads ** 2)

    # 2. Compute bias-corrected moments
    m_hat = m / (1 - beta1 ** t)
    v_hat = v / (1 - beta2 ** t)

    # 3. Apply decoupled weight decay directly to parameters
    params = params - lr * weight_decay * params

    # 4. Step parameters along adaptive gradient direction
    params = params - (lr * m_hat) / (np.sqrt(v_hat) + eps)

    return params, m, v`,
      explanation: "Implements pure AdamW with first and second moment bias corrections and decoupled L2 decay.",
    },
    quizQuestions: [
      {
        question: "Why does AdamW decouple weight decay from the gradient update?",
        options: [
          "To prevent adaptive learning rate scales from shrinking the effective regularization on frequent features.",
          "To speed up matrix multiplication in CUDA cores.",
          "Because weight decay is mathematically identical to dropout.",
          "To avoid computing second-order Hessian tensors.",
        ],
        correctIndex: 0,
        explanation:
          "In classical Adam, L2 regularization added to gradients gets divided by sqrt(v), leading to under-regularization of weights with large gradients. AdamW fixes this.",
      },
    ],
    resources: [
      {
        title: "Loshchilov & Hutter: Decoupled Weight Decay Regularization (AdamW)",
        url: "https://arxiv.org/abs/1711.05101",
        type: "article",
        description: "The original seminal paper introducing the AdamW optimizer.",
      },
    ],
  },

  // Phase 3.3: Transformer Architecture & Multi-Head Attention
  "transformer_architecture_multihead_attention": {
    topicId: "aiml_3_3",
    title: "Transformer Architecture & Multi-Head Attention",
    subtitle: "Query, Key, Value projection matrices, scaled dot-product attention, and causal masking.",
    domain: "Machine Learning & AI",
    phaseName: "Advanced Topics",
    duration: "55m",
    type: "concept",
    keyObjectives: [
      "Deconstruct Scaled Dot-Product Attention: Attention(Q, K, V) = softmax((Q K^T) / sqrt(d_k)) V.",
      "Understand Query, Key, and Value linear projection matrices and multi-head representation splitting.",
      "Implement causal masking for autoregressive generative decoding.",
      "Analyze FlashAttention memory efficiency and KV-cache latency optimizations.",
    ],
    deepDive: {
      overview:
        "The Transformer architecture introduced in 'Attention Is All You Need' completely replaced recurrent neural networks by processing entire token sequences simultaneously. Instead of passing a hidden state sequentially, tokens interact directly via pairwise self-attention.",
      mentalModel:
        "Think of a library catalog system. Each token generates a Query ('What information am I looking for?'), a Key ('What information do I contain?'), and a Value ('What content do I provide?'). The dot product between Query and Key measures relevance, yielding attention weights that retrieve a weighted sum of Values.",
      coreConcepts: [
        {
          title: "Scaled Dot-Product Attention",
          description:
            "Multiplying Q by K^T produces an (N, N) matrix of attention scores. Dividing by sqrt(d_k) prevents large dot products from pushing softmax gradients into saturation regions.",
          highlight: "Softmax((Q K^T) / sqrt(d_k)) V normalizes similarity scores into probability distributions.",
        },
      ],
      pitfalls: [
        "Omitting Causal Masking in Decoders: Without causal masking, tokens can attend to future positions, destroying autoregressive learning.",
      ],
      realWorldApplications:
        "Powers GPT-4, Gemini, Claude, LLaMA, BERT, Vision Transformers (ViT), and modern diffusion models.",
    },
    codeBlueprint: {
      language: "python",
      languageBadge: "Python 3.12 • PyTorch",
      filename: "multihead_attention.py",
      code: `import torch
import torch.nn as nn
import math

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model: int = 512, n_heads: int = 8):
        super().__init__()
        assert d_model % n_heads == 0
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads

        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

    def forward(self, x: torch.Tensor, mask: torch.Tensor = None) -> torch.Tensor:
        batch_size, seq_len, _ = x.shape

        # Linear projections & split into heads: (B, H, S, d_k)
        Q = self.W_q(x).view(batch_size, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        K = self.W_k(x).view(batch_size, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        V = self.W_v(x).view(batch_size, seq_len, self.n_heads, self.d_k).transpose(1, 2)

        # Scaled dot-product attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float("-inf"))

        attn_weights = torch.softmax(scores, dim=-1)
        output = torch.matmul(attn_weights, V)

        # Concatenate heads and final projection
        output = output.transpose(1, 2).contiguous().view(batch_size, seq_len, self.d_model)
        return self.W_o(output)`,
      explanation:
        "Full PyTorch implementation of Multi-Head Self-Attention with multi-head tensor reshaping and causal mask support.",
    },
    quizQuestions: [
      {
        question: "Why do we divide Q @ K^T by sqrt(d_k) before applying softmax?",
        options: [
          "To keep dot product magnitudes reasonable and avoid vanishing gradients in softmax.",
          "To invert the matrix into an orthogonal subspace.",
          "To normalize token embeddings to unit variance.",
          "To convert token length from quadratic to linear complexity.",
        ],
        correctIndex: 0,
        explanation:
          "For large dimension d_k, the dot products grow large in magnitude, driving softmax into regions with extremely small gradients. Dividing by sqrt(d_k) counteracts this growth.",
      },
    ],
    resources: [
      {
        title: "Vaswani et al.: Attention Is All You Need",
        url: "https://arxiv.org/abs/1706.03762",
        type: "article",
        description: "The landmark paper that introduced the Transformer architecture.",
      },
    ],
  },
};
