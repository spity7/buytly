const applyParsed = (req, source, data) => {
  if (source === "query" || source === "params") {
    const target = req[source];
    for (const key of Object.keys(target)) {
      if (!(key in data)) {
        delete target[key];
      }
    }
    Object.assign(target, data);
    return;
  }

  req[source] = data;
};

export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(result.error);
    }

    applyParsed(req, source, result.data);
    next();
  };

export const validateMultiple = (schemas) => (req, res, next) => {
  for (const [source, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(result.error);
    }
    applyParsed(req, source, result.data);
  }
  next();
};
