/**
 * Zod validation middleware factory.
 * Usage: router.post("/", validate(myZodSchema), handler)
 *
 * Validates req.body by default. Pass { source: "query" } or { source: "params" } for others.
 */
const validate = (schema, { source = "body" } = {}) => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const issues = result.error?.issues ?? result.error?.errors ?? [];
      const messages = issues.map(
        (e) => `${(e.path ?? []).join(".")}: ${e.message}`
      );
      return res.status(400).json({
        success: false,
        message: messages.join("; "),
        data: null,
      });
    }
    req[source] = result.data;
    next();
  };
};

export default validate;
