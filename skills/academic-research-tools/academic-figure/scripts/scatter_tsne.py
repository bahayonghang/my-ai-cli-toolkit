"""
Reproduce: image7.png — t-SNE Latent Memory Visualization
Style: serif (Computer Modern via usetex), light gray grid,
       4-spine box, annotation boxes with cluster color edges.
"""

import numpy as np
import os
import shutil
import sys
import matplotlib
matplotlib.use('Agg')   # 非交互后端，须在导入 pyplot 之前设置
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

# ── LaTeX 检测 ─────────────────────────────────────────────
# PATH 中有 latex 时启用 usetex。没有 latex，或设置环境变量
# ACADEMIC_FIGURE_NO_TEX=1 时，改用 mathtext 与 matplotlib 自带的 Computer
# Modern 字体（cmr10 常规、cmb10 粗体、cmti10 斜体），图中不出现未解析的 TeX 命令。
USE_TEX = (shutil.which('latex') is not None
           and os.environ.get('ACADEMIC_FIGURE_NO_TEX') != '1')
if USE_TEX:
    plt.rcParams.update({
        'text.usetex': True,
        'font.family': 'serif',
        'font.serif': ['Computer Modern Roman', 'STIX Two Text', 'DejaVu Serif'],
        'axes.unicode_minus': False,
    })
else:
    plt.rcParams.update({
        'text.usetex': False,
        'font.family': 'serif',
        'font.serif': ['cmr10', 'DejaVu Serif'],
        'mathtext.fontset': 'cm',
        'axes.formatter.use_mathtext': True,   # cmr10 无减号字形，刻度走 mathtext
        'axes.unicode_minus': False,
    })
# 粗体：usetex 用 fontweight；降级路径用 cmb10 字体（cmb10 只有常规字重，不能再叠加 bold）
BOLD = {'fontweight': 'bold'} if USE_TEX else {'fontfamily': 'cmb10'}


def tex_bold(text):
    """粗体标签：usetex 时返回 \\textbf{...}，否则返回原文（调用处再传 BOLD）。"""
    return r'\textbf{' + text + '}' if USE_TEX else text

rng = np.random.default_rng(42)

def cluster(cx, cy, n, rx=8, ry=8, shape='round'):
    """生成一个椭圆形聚类，shape='round'|'elongated'"""
    if shape == 'elongated':
        angles = rng.uniform(0, 2 * np.pi, n)
        r = rng.rayleigh(1.0, n)
        x = cx + rx * r * np.cos(angles)
        y = cy + ry * r * np.sin(angles)
    else:
        x = rng.normal(cx, rx, n)
        y = rng.normal(cy, ry, n)
    return x, y


# ---- 数据集颜色（严格参照原图） ----
DS = {
    'GSM8K':    {'color': '#6A4C93', 'n': 900,  'cx':  10, 'cy':  12, 'rx': 9,  'ry': 12},
    'MATH':     {'color': '#D651A0', 'n': 700,  'cx':  8,  'cy':  32, 'rx': 7,  'ry': 8},
    'GPQA':     {'color': '#F06292', 'n': 300,  'cx':  18, 'cy':  50, 'rx': 5,  'ry': 6},
    'KodCode':  {'color': '#FF8A65', 'n': 500,  'cx':  38, 'cy': -10, 'rx': 9,  'ry': 10},
    'BCB':      {'color': '#FFB74D', 'n': 600,  'cx':  18, 'cy': -30, 'rx': 10, 'ry': 9},
    'ALFWorld': {'color': '#FFF176', 'n': 280,  'cx': -10, 'cy': -42, 'rx': 12, 'ry': 10},  # 黄色！
    'TriviaQA': {'color': '#C888E8', 'n': 700,  'cx': -42, 'cy':   5, 'rx': 14, 'ry': 22},
}

# ---- 注释框配置（统一深灰边框，与原图一致；GPQA 也添加）----
ANNOTS = [
    {'name': 'MATH',     'xy': (8,  32),  'xytext': (8,  32)},
    {'name': 'GSM8K',    'xy': (10, 10),  'xytext': (10, 10)},
    {'name': 'GPQA',     'xy': (18, 52),  'xytext': (18, 52)},
    {'name': 'KodCode',  'xy': (38,-10),  'xytext': (38,-10)},
    {'name': 'BCB',      'xy': (18,-30),  'xytext': (18,-30)},
    {'name': 'ALFWorld', 'xy': (-10,-42), 'xytext': (-10,-42)},
    {'name': 'TriviaQA', 'xy': (-42,  5), 'xytext': (-42,  5)},
]
BBOX_EDGECOLOR = '#2C3E50'   # 统一深蓝灰

fig, ax = plt.subplots(figsize=(7.5, 6.2))

for name, cfg in DS.items():
    x, y = cluster(cfg['cx'], cfg['cy'], cfg['n'], cfg['rx'], cfg['ry'])
    ax.scatter(x, y, c=cfg['color'], s=14, alpha=0.55,
               linewidths=0, rasterized=True, label=name, zorder=2)

# ---- 注释框 ----
for ann in ANNOTS:
    color = DS[ann['name']]['color']
    # 注释框：与簇色同色相的浅色半透明底（原图风格）
    import matplotlib.colors as mcolors
    rgba = list(mcolors.to_rgba(color))
    rgba[3] = 0.28   # alpha for facecolor
    ax.annotate(
        tex_bold(ann['name']),
        xy=ann['xy'], xytext=ann['xytext'],
        fontsize=10.0, **BOLD,
        bbox=dict(
            boxstyle='round,pad=0.30',
            facecolor=tuple(rgba),
            edgecolor=BBOX_EDGECOLOR,
            linewidth=0.9,
        ),
        ha='center', va='center', zorder=5,
    )

# ---- Axes 样式 ----
ax.set_xlabel(tex_bold('t-SNE Component 1'), fontsize=12, **BOLD)
ax.set_ylabel(tex_bold('t-SNE Component 2'), fontsize=12, **BOLD)
ax.set_title(
    tex_bold('Latent Memory Visualization') + '\n'
    + tex_bold('(across all benchmarks)'),
    fontsize=13.5, pad=8, linespacing=1.4, **BOLD,
)

ax.set_xlim(-88, 70)
ax.set_ylim(-75, 80)
ax.xaxis.set_major_locator(plt.MultipleLocator(20))
ax.yaxis.set_major_locator(plt.MultipleLocator(20))

# 四边框，深灰接近原图
for sp in ax.spines.values():
    sp.set_visible(True)
    sp.set_linewidth(0.9)
    sp.set_color('#333333')

ax.tick_params(direction='in', length=4, width=0.8, labelsize=10,
               color='#333333')

# 浅灰点线网格（原图风格）
ax.grid(True, color='#E0E0E0', linewidth=0.6, linestyle=':', zorder=0)
ax.set_axisbelow(True)

# ---- 图例（原图有白底浅灰框） ----
leg = ax.legend(
    loc='upper right',
    fontsize=9.5,
    frameon=True,
    facecolor='white',
    edgecolor='#CCCCCC',
    framealpha=1.0,
    markerscale=1.0,
    handlelength=0.8,
    handleheight=0.8,
    handletextpad=0.5,
    labelspacing=0.25,
    borderpad=0.5,
    borderaxespad=0.5,
)

fig.tight_layout(pad=0.9)
out_path = sys.argv[1] if len(sys.argv) > 1 else 'scatter_tsne_repro.png'
fig.savefig(out_path, dpi=300, facecolor='white')
plt.close(fig)
print(f'saved: {os.path.abspath(out_path)}')
