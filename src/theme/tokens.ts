/* Theme tokens - color palette, spacing, typography, etc.

This file defines the core design tokens used throughout the application.

Color Palette:
- primary: #3B82F6
- secondary: #10B981
- accent: #F59E0B
- background: #FFFFFF
- surface: #F9FAFB
- text: #111827
- disabled: #9CA3AF

Spacing:
- xs: 0.25rem
- sm: 0.5rem
- md: 1rem
- lg: 1.5rem
- xl: 2rem

Typography:
- body: 'Inter', sans-serif
- heading: 'Inter', sans-serif
- fontSize: {
  xs: 0.75rem,
  sm: 0.875rem,
  base: 1rem,
  lg: 1.125rem,
  xl: 1.25rem
}

Radius:
- xs: 0.125rem
- sm: 0.25rem
- md: 0.5rem
- lg: 1rem
- full: 9999px

Transition:
- duration: 200ms
- ease: ease-in-out

Shadow:
- sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
*/

export default {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#2e0bf5',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    disabled: '#9CA3AF'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  typography: {
    body: 'Inter, sans-serif',
    heading: 'Inter, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    }
  },
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px'
  },
  transition: {
    duration: '200ms',
    ease: 'ease-in-out'
  },
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }
};