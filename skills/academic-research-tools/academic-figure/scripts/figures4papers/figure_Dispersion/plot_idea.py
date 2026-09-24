# Ported from ChenLiu-1996/figures4papers figure_Dispersion/plot_idea.py @ 3c181f8, CC BY-NC 4.0. See references/attribution.md.
import shutil
import sys
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')  # select a non-interactive backend before importing pyplot
import matplotlib.pyplot as plt

OUT_DIR = sys.argv[1] if len(sys.argv) > 1 else '.'
DPI = int(os.environ.get('ACADEMIC_FIGURE_DPI', '300'))  # upstream default: 300
SANS_SERIF = ['Helvetica', 'Arial', 'DejaVu Sans']
# LaTeX check: usetex runs only when `latex` is on PATH and ACADEMIC_FIGURE_NO_TEX is not 1.
# Otherwise mathtext draws the same labels, and no raw TeX command reaches the figure.
USE_TEX = shutil.which('latex') is not None and os.environ.get('ACADEMIC_FIGURE_NO_TEX') != '1'


EPSILON = 1e-6

def sample_points_in_ball(num_points, theta_range=2*np.pi):
    r = np.sqrt(np.random.uniform(0, 0.95, num_points))
    theta = np.random.uniform(np.pi/2 - theta_range/2, np.pi/2 + theta_range/2, num_points)
    x = r * np.cos(theta)
    y = r * np.sin(theta)
    return np.stack([x, y], axis=1)

def plot_ball_with_points(ax, pts, facecolor):
    num_points_grid = 512

    xs = np.linspace(-1, 1, num_points_grid)
    ys = np.linspace(-1, 1, num_points_grid)
    x, y = np.meshgrid(xs, ys)
    r2 = x**2 + y**2
    mask = r2 <= 1.0
    z = np.zeros_like(x)
    z[mask] = np.sqrt(1.0 - r2[mask])

    nx, ny, nz = x.copy(), y.copy(), z.copy()
    norm = np.sqrt(nx**2 + ny**2 + nz**2) + EPSILON
    nx, ny, nz = nx / norm, ny / norm, nz / norm

    # light from top left.
    light_dir = np.array([-0.5, 0.5, 0.8])
    light_dir /= np.linalg.norm(light_dir)
    intensity = np.maximum(0.0, nx*light_dir[0] + ny*light_dir[1] + nz*light_dir[2])
    shade = np.clip(-0.5 + 2.0*intensity, 0, 1)

    img = np.ones((num_points_grid, num_points_grid))
    img[mask] = shade[mask]

    ax.imshow(img, cmap='gray', origin='lower', extent=[-1, 1, -1, 1], vmin=0, vmax=1, alpha=0.3)
    ax.set_xlim([-2, 2])
    ax.set_ylim([-2, 2])
    ax.set_axis_off()

    # add points on sphere.
    ax.scatter(pts[:, 0], pts[:, 1], s=80, facecolor=facecolor, edgecolor='black', alpha=0.8)
    for i in range(pts.shape[0]):
        ax.plot([pts[i, 0], 0], [pts[i, 1], 0],
                linestyle="--", color="black", linewidth=1, alpha=0.8)

    return ax


if __name__ == "__main__":
    save_path = os.path.join(OUT_DIR, 'idea.png')
    num_points = 16

    np.random.seed(1)
    plt.rcParams['text.usetex'] = USE_TEX
    if not USE_TEX:
        plt.rcParams['mathtext.fontset'] = 'cm'
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.sans-serif'] = SANS_SERIF
    fig = plt.figure(figsize=(18, 6))

    ax = fig.add_subplot(1, 3, 1)
    pts = sample_points_in_ball(num_points=num_points)
    plot_ball_with_points(ax, pts, facecolor='#cde5f8')

    ax = fig.add_subplot(1, 3, 2)
    pts = sample_points_in_ball(num_points=num_points, theta_range=np.pi/4)
    plot_ball_with_points(ax, pts, facecolor='#6a98cb')

    ax = fig.add_subplot(1, 3, 3)
    pts = sample_points_in_ball(num_points=num_points)
    plot_ball_with_points(ax, pts, facecolor='#6a98cb')

    os.makedirs(OUT_DIR, exist_ok=True)
    fig.tight_layout(pad=2)
    fig.savefig(save_path, dpi=DPI)
    print('saved:', os.path.abspath(save_path))
