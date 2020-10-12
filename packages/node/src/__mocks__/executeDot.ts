export const executeDot = jest.fn().mockImplementation(async (dot: string) => Buffer.from(dot));
