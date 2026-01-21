# Demi Website - Theming System

## Overview
All CSS values have been extracted into SCSS variables in `/src/styles/_variables.scss` to enable easy theming and consistent styling across the website.

## How to Use

### Importing Variables
All SCSS files should import the variables file at the top:

```scss
@import '../../styles/variables';
// or adjust path based on file location
@import '../styles/variables';
```

### Variable Categories

#### Colors
- **Primary Colors**: `$primary-color`, `$primary-blue`, `$primary-hover`
- **Background Colors**: `$bg-dark`, `$bg-gradient-start`, `$bg-gradient-end`, `$bg-primary-gradient`, `$bg-navbar`
- **Text Colors**: `$text-primary`, `$text-dark`, `$text-secondary`
- **Alert Colors**: `$warning-bg`, `$warning-border`, `$warning-text`, `$success-bg`, `$success-text`
- **Border Colors**: `$border-dark`, `$border-light`
- **Link Colors**: `$link-color`, `$link-hover`

#### Spacing
- **Spacing Scale**: `$spacing-xs` through `$spacing-3xl` (5px - 30px)
- **Margins**: `$margin-xs` through `$margin-xl` (0.5rem - 10em)
- **Padding**: `$padding-xs` through `$padding-xl` (5px - 30px)
- **Gaps**: `$gap-xs`, `$gap-sm`, `$gap-md` (10px - 50px)

#### Typography
- **Font Family**: `$font-family-primary`
- **Font Sizes**: `$font-size-xs` through `$font-size-4xl` (14px - 2rem)
- **Font Weights**: `$font-weight-normal`, `$font-weight-bold`, `$font-weight-semi-bold`

#### Layout
- **Widths**: `$width-full`, `$width-container`, `$width-nav-menu`, etc.
- **Heights**: `$height-navbar`, `$height-nav-link`, `$height-full-vh`, etc.
- **Sidebar**: `$sidebar-width`, `$sidebar-min-width`, `$sidebar-max-width`

#### Borders & Radius
- **Border Radius**: `$border-radius-sm`, `$border-radius-md`, `$border-radius-lg`
- **Border Width**: `$border-width-sm`, `$border-width-md`

#### Transitions
- **Timing**: `$transition-fast`, `$transition-ease-out`, `$transition-ease-in-out`

#### Effects
- **Shadows**: `$box-shadow-neon`, `$shadow-black`, `$shadow-color`
- **Z-Index**: `$z-index-navbar`, `$z-index-sidebar`, `$z-index-footer`

#### Breakpoints
- `$breakpoint-mobile`: 768px
- `$breakpoint-tablet`: 960px
- `$breakpoint-desktop`: 1200px
- `$breakpoint-large`: 1600px

## Creating Themes

To create a new theme, you can either:

### Option 1: Override Variables
Create a new theme file that overrides specific variables:

```scss
// themes/_dark-theme.scss
@import '../styles/variables';

// Override colors for dark theme
$primary-color: #00ff00;
$bg-dark: #000000;
$text-primary: #00ff00;
```

### Option 2: Create Theme Variants
Create multiple variable files for different themes:

```scss
// styles/_variables-light.scss
$primary-color: #0066cc;
$bg-dark: #f5f5f5;
$text-primary: #000000;

// styles/_variables-dark.scss (current default)
$primary-color: #ffc832;
$bg-dark: #282828;
$text-primary: #fff;
```

Then import the desired theme in each file or globally in `global.scss`.

## Migration Status

### ✅ Completed
- [x] Created central `_variables.scss` file
- [x] Updated `global.scss`
- [x] Updated `Index.scss`
- [x] Updated `Button.scss`
- [x] Updated `Navbar.scss`
- [x] Updated `Footer.scss`
- [x] Updated `DocPage.scss`
- [x] Updated `SearchBar.scss`
- [x] Updated `Search.scss`
- [x] Updated `Highlighting.scss` (kept syntax highlighting colors as local variables)
- [x] Updated `Contact.scss`
- [x] Updated `Sent.scss`
- [x] Updated `About.scss` (file was empty)
- [x] Updated `Errors.scss`
- [x] Updated `Downloads.scss`

**All SCSS files have been updated to use centralized variables!**

## Best Practices

1. **Always use variables** instead of hardcoded values
2. **Import at the top** of every SCSS file
3. **Use semantic names** - if a variable doesn't exist for your use case, add it to `_variables.scss`
4. **Stay consistent** - use the same variable for the same purpose across files
5. **Document changes** - add comments when adding new variables

## Example Usage

```scss
@import '../../styles/variables';

.my-component {
    background: $bg-dark;
    color: $primary-color;
    padding: $padding-md;
    border-radius: $border-radius-md;
    transition: all $transition-fast;
    
    &:hover {
        background: $primary-color;
        color: $bg-dark;
    }
    
    @media screen and (max-width: $breakpoint-tablet) {
        padding: $padding-sm;
    }
}
```

## Notes

- The variables file uses SCSS syntax and requires a SASS preprocessor
- All existing styles have been preserved - only converted to use variables
- No visual changes should occur from this refactoring
- Future theme changes can now be made by simply editing the variables file
