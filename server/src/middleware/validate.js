export function validate(schemas) {
  return (req, res, next) => {
    for (const [key, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[key] ?? {});
      if (!result.success) return next(result.error);

      if (key === 'query') {
        // req.query is a getter in express 5, plain assignment throws
        Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true });
      } else {
        req[key] = result.data;
      }
    }
    next();
  };
}
