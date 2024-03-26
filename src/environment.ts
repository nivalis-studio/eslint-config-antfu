import { isPackageExists } from 'local-pkg';

export const IN_IS_EDITOR = !!(
  (process.env.VSCODE_PID ||
    process.env.VSCODE_CWD ||
    process.env.JETBRAINS_IDE ||
    process.env.VIM) &&
  !process.env.CI
);
export const HAS_TYPESCRIPT = isPackageExists('typescript');
export const HAS_REACT = isPackageExists('react');
export const HAS_NEXTJS = isPackageExists('next');
export const HAS_TAILWINDCSS = isPackageExists('tailwindcss');
export const HAS_GRAPHQL = isPackageExists('graphql');
export const HAS_ASTRO = isPackageExists('astro');

const VuePackages = ['vue', 'nuxt', 'vitepress', '@slidev/cli'];

export const HAS_VUE = VuePackages.some(i => isPackageExists(i));
