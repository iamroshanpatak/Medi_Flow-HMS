/* CSS type declarations for side-effect imports and CSS modules */

declare module '*.css' {
  const content: any;
  export default content;
}

declare module '*.css?*' {
  const content: any;
  export default content;
}
