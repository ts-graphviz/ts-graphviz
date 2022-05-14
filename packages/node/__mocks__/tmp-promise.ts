export const file = jest.fn().mockResolvedValue({
  path: '/path/to/mock',
  fd: 0,
  cleanup: jest.fn(),
});
