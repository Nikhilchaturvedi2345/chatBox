import validator from "validator";

export const sanitizeInput = (input) => {
    return validator.escape(input.trim());
  };
  