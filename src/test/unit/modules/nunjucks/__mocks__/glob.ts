// Mock for glob to avoid ES module parsing issues in Jest
/* eslint-disable  @typescript-eslint/no-explicit-any */
const globFn: any = jest.fn().mockResolvedValue([]);
globFn.sync = jest.fn().mockReturnValue([]);

export const glob = globFn;
