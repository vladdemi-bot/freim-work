declare module 'class-transformer' {
  export function Exclude(): ClassDecorator & PropertyDecorator;
  export function Expose(): PropertyDecorator;
}
