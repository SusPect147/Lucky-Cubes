function format(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 't';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'b';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'm';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'k';
    return n.toFixed(2).replace(/\.?0+$/, '');
}

