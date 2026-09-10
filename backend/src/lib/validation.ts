export const formatValidationErrors = (
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const issue of issues) {
    const field =
      typeof issue.path[0] === "string" && issue.path[0].length > 0
        ? issue.path[0]
        : "_root";

    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
};
