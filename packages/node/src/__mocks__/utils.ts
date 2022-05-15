export const close = jest.fn().mockReturnValue(undefined);
export const writeFile = jest.fn().mockReturnValue(undefined);
export const execFile = jest.fn().mockReturnValue({
  stdout: Buffer.from([]),
});
