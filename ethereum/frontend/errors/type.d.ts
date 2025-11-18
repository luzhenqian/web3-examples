export type Error = { code: number; message: string };
export type Errors = { [key in string]: Error };
