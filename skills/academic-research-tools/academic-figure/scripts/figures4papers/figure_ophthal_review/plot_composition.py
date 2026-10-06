# Ported from ChenLiu-1996/figures4papers figure_ophthal_review/plot_composition.py @ 3c181f8, CC BY-NC 4.0. See references/attribution.md.
import shutil
import sys
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')  # select a non-interactive backend before importing pyplot
from matplotlib import pyplot as plt
import seaborn as sns

OUT_DIR = sys.argv[1] if len(sys.argv) > 1 else '.'
DPI = int(os.environ.get('ACADEMIC_FIGURE_DPI', '300'))  # upstream default: 300
SANS_SERIF = ['Helvetica', 'Arial', 'DejaVu Sans']
# LaTeX check: usetex runs only when `latex` is on PATH and ACADEMIC_FIGURE_NO_TEX is not 1.
# Otherwise mathtext draws the same labels, and no raw TeX command reaches the figure.
USE_TEX = shutil.which('latex') is not None and os.environ.get('ACADEMIC_FIGURE_NO_TEX') != '1'


DATA = {
    'clinical_stage': [
        'Benchmark\nEvaluation', 'Expert\nEvaluation', 'Retrospective\nClinical Validation',
        'Prospective\nPilot Study', 'Full\nClinical Trial',
    ],
    'pub_by_category':
        {
            'Clinical Workflow': {
                'Screening or Diagnosis': [10, 7, 10, 3, 0],
                'Report Generation': [2, 3, 3, 0, 0],
                'Treatment Planning or\nRecommendation': [2, 3, 3, 2, 0],
            },
            'Patient Support': {
                'Patient Question Answering': [5, 13, 1, 1, 0],
                'After Visit or Discharge\nSummary Generation': [0, 2, 0, 0, 0],
                'Consultation or Interview': [0, 1, 1, 0, 0],
                'Patient Education\nMaterial Generation': [1, 6, 0, 0, 0],
                'Physician Recommendation': [0, 1, 0, 0, 0],
            },
            'Education and Training': {
                'Exam Taking': [19, 5, 0, 0, 0],
                'Medical Education and\nLearning Support': [3, 5, 0, 0, 0],
            }
        }
}

def plot_heatmap(fig_name: str):
    plt.rcParams['text.usetex'] = USE_TEX
    if not USE_TEX:
        plt.rcParams['mathtext.fontset'] = 'cm'
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.sans-serif'] = SANS_SERIF
    plt.rcParams['font.size'] = 16
    plt.rcParams['axes.spines.right'] = False
    plt.rcParams['axes.spines.top'] = False
    plt.rcParams['axes.linewidth'] = 2

    os.makedirs(OUT_DIR, exist_ok=True)
    fig = plt.figure(figsize=(14, 10))

    ax = fig.add_subplot(1, 1, 1)
    category_count_arr, category_arr = [], []
    subcategory_arr = []
    value_arr = []
    for category in DATA['pub_by_category']:
        subcategories = DATA['pub_by_category'][category].keys()
        category_count_arr.append(len(subcategories))
        category_arr.append(category)
        for subcategory in subcategories:
            value = DATA['pub_by_category'][category][subcategory]
            subcategory_arr.append(subcategory)
            value_arr.append(value)
    value_arr = np.stack(value_arr, axis=0)
    for loc, item in enumerate(subcategory_arr):
        item += '\n' + rf'($n={value_arr[loc, :].sum()}$)'
        subcategory_arr[loc] = item
    stage_arr = DATA['clinical_stage']
    for loc, item in enumerate(stage_arr):
        item += '\n' + rf'($n={value_arr[:, loc].sum()}$)'
        stage_arr[loc] = item

    hm = sns.heatmap(value_arr, annot=True, vmin=0, vmax=20, fmt='d', cmap='Reds',
                linewidths=1, linecolor='white', ax=ax, cbar=True)
    cbar = hm.collections[0].colorbar
    cbar.set_ticks([0, 5, 10, 15, 20])
    cbar.set_ticklabels([0, 5, 10, 15, 20])
    ax.set_yticks(np.arange(len(subcategory_arr)) + 0.5)
    ax.set_yticklabels(subcategory_arr, rotation=0)
    ax.set_xticks(np.arange(len(stage_arr)) + 0.5)
    ax.set_xticklabels(stage_arr, rotation=0)

    fig.tight_layout(pad=2)
    fig.savefig(fig_name, dpi=DPI)
    print('saved:', os.path.abspath(fig_name))
    return


if __name__ == '__main__':
    plot_heatmap(os.path.join(OUT_DIR, 'composition_heatmap.png'))