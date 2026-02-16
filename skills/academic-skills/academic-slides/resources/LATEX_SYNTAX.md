# LaTeX Beamer Syntax Reference

## Setup

```latex
\documentclass[10pt, aspectratio=169]{beamer}
\usetheme{metropolis}

% Packages
\usepackage[utf8]{inputenc}
\usepackage{amsmath, amssymb, amsfonts}
\usepackage{graphicx}
\usepackage{booktabs}
\usepackage{hyperref}
\usepackage{appendixnumberbeamer}

% CJK support (uncomment for Chinese)
% \usepackage{ctex}

% Metadata
\title{Title}
\subtitle{Subtitle}
\author{Author}
\institute{Institution}
\date{Date}
```

## Structure

```latex
\begin{document}

\maketitle                              % or \begin{frame}\titlepage\end{frame}

\begin{frame}{Outline}
  \tableofcontents
\end{frame}

\section{Section Title}                 % Section divider

\begin{frame}{Slide Title}             % Regular slide
  Content here
\end{frame}

\begin{frame}[standout]                % Standout slide (metropolis)
  Thank You! \\ Questions?
\end{frame}

\appendix                              % Appendix marker
\end{document}
```

## Animation

```latex
\pause                                  % Progressive reveal
\onslide<2->{Content}                  % Show from step 2
\only<1>{Content}                      % Show only on step 1
\uncover<2->{Content}                  % Uncover from step 2
```

## Layout

```latex
% Two-column layout
\begin{columns}[T]
  \begin{column}{0.48\textwidth}
    Left column
  \end{column}
  \begin{column}{0.48\textwidth}
    Right column
  \end{column}
\end{columns}
```

## Math

```latex
% Display math
\[ y = \sigma(\mathbf{w}^T \mathbf{x} + b) \]
% Inline math
$\mathbf{x}$
% Aligned equations
\begin{align*}
  L &= \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2
\end{align*}
```

## Tables

```latex
\begin{table}
  \centering
  \begin{tabular}{lll}
    \toprule
    \textbf{Header 1} & \textbf{Header 2} & \textbf{Header 3} \\
    \midrule
    Cell 1 & Cell 2 & Cell 3 \\
    \bottomrule
  \end{tabular}
\end{table}
```

## Text Formatting

```latex
\textbf{bold}                          % Bold
\textit{italic}                        % Italic
\alert{highlighted}                    % Theme-colored emphasis
{\Large Large text}                    % Size change
\begin{itemize}                        % Unordered list
  \item Bullet point
\end{itemize}
\begin{enumerate}                      % Ordered list
  \item Numbered item
\end{enumerate}
```

## Chinese Configuration

```latex
% Add to preamble:
\usepackage{ctex}
% Compile with: latexmk -xelatex file.tex
```

## Minimalist Theme Setup

```latex
\usetheme{default}
\setbeamertemplate{navigation symbols}{}
\setbeamertemplate{footline}{}
\setbeamertemplate{headline}{}
\definecolor{MainText}{gray}{0.15}
\definecolor{AccentColor}{RGB}{0, 102, 204}
```
