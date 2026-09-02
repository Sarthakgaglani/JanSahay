import os
from PIL import Image, ImageDraw

def draw_jansahay_logo(size):
    """Generate a crisp JanSahay AI logo icon at specified square resolution."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    padding = int(size * 0.04)
    corner_radius = int(size * 0.22)
    
    # Premium Indigo-to-Purple gradient background (#4f46e5 to #7c3aed)
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=corner_radius,
        fill=(79, 70, 229, 255)
    )
    
    center = size // 2
    
    # Glowing backdrop ring
    ring_radius = int(size * 0.32)
    draw.ellipse(
        [center - ring_radius, center - ring_radius, center + ring_radius, center + ring_radius],
        outline=(255, 255, 255, 140),
        width=max(2, size // 36)
    )
    
    # Main AI Sparkle emblem in bright white
    r = int(size * 0.20)
    sparkle_points = [
        (center, center - r),
        (center + int(r * 0.35), center - int(r * 0.35)),
        (center + r, center),
        (center + int(r * 0.35), center + int(r * 0.35)),
        (center, center + r),
        (center - int(r * 0.35), center + int(r * 0.35)),
        (center - r, center),
        (center - int(r * 0.35), center - int(r * 0.35)),
    ]
    draw.polygon(sparkle_points, fill=(255, 255, 255, 255))
    
    # Secondary Top-Right Sparkle
    sr = int(size * 0.07)
    cx = center + int(size * 0.20)
    cy = center - int(size * 0.20)
    sparkle2_points = [
        (cx, cy - sr),
        (cx + int(sr * 0.35), cy),
        (cx, cy + sr),
        (cx - int(sr * 0.35), cy),
    ]
    draw.polygon(sparkle2_points, fill=(255, 255, 255, 230))
    
    # Secondary Bottom-Left Sparkle
    sr2 = int(size * 0.05)
    cx2 = center - int(size * 0.22)
    cy2 = center + int(size * 0.18)
    sparkle3_points = [
        (cx2, cy2 - sr2),
        (cx2 + int(sr2 * 0.35), cy2),
        (cx2, cy2 + sr2),
        (cx2 - int(sr2 * 0.35), cy2),
    ]
    draw.polygon(sparkle3_points, fill=(255, 255, 255, 200))
    
    return img

def main():
    public_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'public')
    os.makedirs(public_dir, exist_ok=True)
    
    sizes = {
        'pwa-512x512.png': 512,
        'pwa-192x192.png': 192,
        'apple-touch-icon.png': 180,
    }
    
    for filename, size in sizes.items():
        img = draw_jansahay_logo(size)
        out_path = os.path.join(public_dir, filename)
        img.save(out_path, 'PNG')
        print(f"Generated {filename} ({size}x{size})")
        
    # Generate favicon.ico
    fav_img = draw_jansahay_logo(64)
    ico_path = os.path.join(public_dir, 'favicon.ico')
    fav_img.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("Generated favicon.ico")
    
    # Generate masked-icon.svg if not exists
    svg_path = os.path.join(public_dir, 'masked-icon.svg')
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="112" fill="#4f46e5"/>
  <circle cx="256" cy="256" r="160" stroke="#ffffff" stroke-width="14" stroke-opacity="0.6"/>
  <path fill="#ffffff" d="M256 153.6 L273.92 238.08 L358.4 256 L273.92 273.92 L256 358.4 L238.08 273.92 L153.6 256 L238.08 238.08 Z"/>
  <path fill="#ffffff" fill-opacity="0.9" d="M358.4 153.6 L365.12 182.27 L393.79 189 L365.12 195.73 L358.4 224.4 L351.68 195.73 L323.01 189 L351.68 182.27 Z"/>
</svg>'''
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print("Generated masked-icon.svg")

if __name__ == '__main__':
    main()
