const PREVIEW_ENV = process.env.PREVIEW_ENV

figma.showUI(__html__, {
  // themeColors: true
});

figma.skipInvisibleInstanceChildren = true;

if (PREVIEW_ENV === 'figma') {
  figma.ui.resize(300, 100);
} else {
  figma.ui.resize(340, 420);
}