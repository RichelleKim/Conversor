document.addEventListener('DOMContentLoaded', () => {
    const rgbInput = document.getElementById('rgb');
    const cmykInput = document.getElementById('cmyk');
    const hslInput = document.getElementById('hsl');
    const hsvInput = document.getElementById('hsv');
    const colorDisplay = document.getElementById('color-display');

    function updateColorDisplay(color) {
        colorDisplay.style.backgroundColor = color;
    }

    function rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
    }

    function rgbToCmyk(r, g, b) {
        const c = 1 - (r / 255);
        const m = 1 - (g / 255);
        const y = 1 - (b / 255);
        const k = Math.min(c, m, y);
        return [
            ((c - k) / (1 - k) * 100).toFixed(0),
            ((m - k) / (1 - k) * 100).toFixed(0),
            ((y - k) / (1 - k) * 100).toFixed(0),
            (k * 100).toFixed(0)
        ];
    }

    function cmykToRgb(c, m, y, k) {
        const r = 255 * (1 - c / 100) * (1 - k / 100);
        const g = 255 * (1 - m / 100) * (1 - k / 100);
        const b = 255 * (1 - y / 100) * (1 - k / 100);
        return [Math.round(r), Math.round(g), Math.round(b)];
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [
            (h * 360).toFixed(0),
            (s * 100).toFixed(0) + '%',
            (l * 100).toFixed(0) + '%'
        ];
    }

    function hslToRgb(h, s, l) {
        h /= 360;
        s = parseFloat(s) / 100;
        l = parseFloat(l) / 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        const s = max === 0 ? 0 : d / max;
        const v = max;

        let h;
        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [
            (h * 360).toFixed(0),
            (s * 100).toFixed(0) + '%',
            (v * 100).toFixed(0) + '%'
        ];
    }

    function hsvToRgb(h, s, v) {
        h /= 360;
        s = parseFloat(s) / 100;
        v = parseFloat(v) / 100;

        let r, g, b;

        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function updateInputsFromRgb(r, g, b) {
        rgbInput.value = `${r}, ${g}, ${b}`;
        const [c, m, y, k] = rgbToCmyk(r, g, b);
        cmykInput.value = `${c}, ${m}, ${y}, ${k}`;
        const [h, s, l] = rgbToHsl(r, g, b);
        hslInput.value = `${h}, ${s}, ${l}`;
        const [h2, s2, v] = rgbToHsv(r, g, b);
        hsvInput.value = `${h2}, ${s2}, ${v}`;
        updateColorDisplay(rgbToHex(r, g, b));
    }

    rgbInput.addEventListener('input', () => {
        const [r, g, b] = rgbInput.value.split(',').map(Number);
        if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
            updateInputsFromRgb(r, g, b);
        }
    });

    cmykInput.addEventListener('input', () => {
        const [c, m, y, k] = cmykInput.value.split(',').map(Number);
        if (c >= 0 && c <= 100 && m >= 0 && m <= 100 && y >= 0 && y <= 100 && k >= 0 && k <= 100) {
            const [r, g, b] = cmykToRgb(c, m, y, k);
            updateInputsFromRgb(r, g, b);
        }
    });

    hslInput.addEventListener('input', () => {
        const [h, s, l] = hslInput.value.split(',').map(v => v.trim());
        if (h >= 0 && h <= 360 && s.endsWith('%') && l.endsWith('%')) {
            const [r, g, b] = hslToRgb(h, s, l);
            updateInputsFromRgb(r, g, b);
        }
    });

    hsvInput.addEventListener('input', () => {
        const [h, s, v] = hsvInput.value.split(',').map(v => v.trim());
        if (h >= 0 && h <= 360 && s.endsWith('%') && v.endsWith('%')) {
            const [r, g, b] = hsvToRgb(h, s, v);
            updateInputsFromRgb(r, g, b);
        }
    });
});