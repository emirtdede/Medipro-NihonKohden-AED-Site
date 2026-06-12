export function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Load saved theme or default to system
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme == 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else if (currentTheme == 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        // System default
        if (prefersDarkScheme.matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    toggleBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');

        if (theme === 'dark') {
            theme = 'light';
        } else {
            theme = 'dark';
        }

        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
}
