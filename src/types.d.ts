/// <reference types="react" />

// Module declarations for external libraries
declare module 'file-saver' {
  export function saveAs(data: any, filename: string): void;
}

declare module 'html2canvas' {
  function html2canvas(element: HTMLElement, options?: any): Promise<HTMLCanvasElement>;
  export default html2canvas;
}

// Suppress other type errors for babel modules
declare module '@babel/core';
declare module '@babel/generator';
declare module '@babel/template';  
declare module '@babel/traverse';
declare module 'estree';