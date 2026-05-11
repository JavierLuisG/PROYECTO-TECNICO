const styleMock = new Proxy({} as Record<string, string>, {
  get: (_, prop: string) => prop,
});

module.exports = styleMock;
