/**
 * Theme configuration for the application
 */

export const theme = {
  colors: {
    background: "#ffffff",
    primary: "#1B1B1B",
    secondary: "#64748B",
    tertiary: "#F5FCFD",
  },
  fonts: {
    primary: "Poppins, sans-serif",
  },
};

/**
 * CSS variables for the theme
 */
export const cssVariables = {
  "--background": theme.colors.background,
  "--foreground": theme.colors.primary,
  "--secondary": theme.colors.secondary,
  "--tertiary": theme.colors.tertiary,
};

/**
 * Tailwind classes for common theme elements
 */
export const themeClasses = {
  text: {
    primary: "text-primary",
    secondary: "text-secondary",
  },
  bg: {
    primary: "bg-background",
    secondary: "bg-tertiary",
  },
  font: "font-sans",
};
