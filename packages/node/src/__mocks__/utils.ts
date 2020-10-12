export const close = jest.fn().mockReturnValue(void 0);
export const writeFile = jest.fn().mockReturnValue(void 0);
export const execFile = jest.fn().mockReturnValue({
  stdout: Buffer.from([]),
});
