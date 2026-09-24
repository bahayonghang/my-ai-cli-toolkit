# Ported from ChenLiu-1996/figures4papers figure_Brainteaser/plot_selfcorrection_math.py @ 3c181f8, CC BY-NC 4.0. See references/attribution.md.
import sys
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')  # select a non-interactive backend before importing pyplot
from matplotlib import pyplot as plt
from matplotlib import gridspec as gridspec

OUT_DIR = sys.argv[1] if len(sys.argv) > 1 else '.'
DPI = int(os.environ.get('ACADEMIC_FIGURE_DPI', '300'))  # upstream default: 300
SANS_SERIF = ['Helvetica', 'Arial', 'DejaVu Sans']


data_math_correcting_llm = {
    'methods': [r'DeepSeek R1 Distill Qwen 1.5B',
                r'DeepSeek R1 Distill Qwen 14B',
                r'DeepSeek R1 Distill Llama 70B',
                r'deepseek-chat (Deepseek-V3)',
                r'deepseek-reasoner (Deepseek-R1)',
                r'OpenAI o3'],
    'colors': ['#DDF3DE', '#AADCA9', '#8BCF8B', '#F6CFCB', '#E9A6A1', '#3775BA'],
    'subtypes': [r'Fault denial$\downarrow$',
                 r'Error misattribution$\downarrow$',
                 r'Degenerate repetition or stuck$\downarrow$',
                 r'Flawed correction$\downarrow$',
                 r'Valid correction$\uparrow$'],
    'result': {
        r'Fault denial$\downarrow$': np.array([1, 0, 0, 1, 0, 0]) / 14 ,
        r'Error misattribution$\downarrow$': np.array([4, 4, 3, 1, 0, 1]) / 14 ,
        r'Degenerate repetition or stuck$\downarrow$': np.array([9, 2, 4, 0, 0, 0]) / 14 ,
        r'Flawed correction$\downarrow$': np.array([0, 1, 0, 1, 3, 2]) / 14 ,
        r'Valid correction$\uparrow$': np.array([0, 7, 7, 12, 11, 11]) / 14 ,
        },
}

data_math_correcting_human = {
    'methods': [r'DeepSeek R1 Distill Qwen 1.5B',
                r'DeepSeek R1 Distill Qwen 14B',
                r'DeepSeek R1 Distill Llama 70B',
                r'deepseek-chat (Deepseek-V3)',
                r'deepseek-reasoner (Deepseek-R1)',
                r'OpenAI o3'],
    'colors': ['#DDF3DE', '#AADCA9', '#8BCF8B', '#F6CFCB', '#E9A6A1', '#3775BA'],
    'subtypes': [r'False confession$\downarrow$',
                 r'Degenerate repetition or stuck$\downarrow$',
                 r'Justified denial$\uparrow$'],
    'result': {
        r'False confession$\downarrow$': np.array([8, 10, 10, 13, 14, 12]) / 14 ,
        r'Degenerate repetition or stuck$\downarrow$': np.array([5, 3, 2, 0, 0, 0]) / 14 ,
        r'Justified denial$\uparrow$': np.array([0, 1, 2, 1, 0, 0]) / 14 ,
        },
}


if __name__ == '__main__':
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.sans-serif'] = SANS_SERIF
    plt.rcParams['font.size'] = 24
    plt.rcParams['axes.spines.right'] = False
    plt.rcParams['axes.spines.top'] = False
    plt.rcParams['axes.linewidth'] = 3

    fig = plt.figure(figsize=(36, 12))

    gs = gridspec.GridSpec(2, 5)

    for subtype_idx, subtype_name in enumerate(data_math_correcting_llm['subtypes']):
        ax = fig.add_subplot(gs[subtype_idx])
        num_methods = len(data_math_correcting_llm['methods'])
        ax.bar(
            np.arange(num_methods),
            data_math_correcting_llm['result'][subtype_name],
            color=data_math_correcting_llm['colors'],
            label=data_math_correcting_llm['methods'],
        )
        if subtype_idx == 0:
            handles, labels = ax.get_legend_handles_labels()

        ax.set_title(data_math_correcting_llm['subtypes'][subtype_idx], fontsize=30, pad=36)
        ax.set_ylabel('Probability', fontsize=30, labelpad=12)
        ax.set_ylim([0, 1])
        ax.set_xticks([])

    for subtype_idx, subtype_name in enumerate(data_math_correcting_human['subtypes']):
        ax = fig.add_subplot(gs[5 + subtype_idx])
        num_methods = len(data_math_correcting_human['methods'])
        ax.bar(
            np.arange(num_methods),
            data_math_correcting_human['result'][subtype_name],
            color=data_math_correcting_human['colors'],
            label=data_math_correcting_human['methods'],
        )

        ax.set_title(data_math_correcting_human['subtypes'][subtype_idx], fontsize=30, pad=36)
        ax.set_ylabel('Probability', fontsize=30, labelpad=12)
        ax.set_ylim([0, 1])
        ax.set_xticks([])

    ax = fig.add_subplot(gs[8:])
    ax.legend(handles, labels, fontsize=30, loc='center', frameon=False)
    ax.set_axis_off()

    fig.tight_layout(pad=2)

    os.makedirs(OUT_DIR, exist_ok=True)
    fig.savefig(os.path.join(OUT_DIR, 'selfcorrection_math.png'), dpi=DPI)
    print('saved:', os.path.abspath(os.path.join(OUT_DIR, 'selfcorrection_math.png')))
    plt.close(fig)
