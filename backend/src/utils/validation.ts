import jwt, { JwtPayload } from 'jsonwebtoken';

export function validateRegistrateUserInput(input: {
  email?: string;
  full_name?: string;
  password?: string;
}) {
  const errors: string[] = [];

  if(input.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!input.email || !emailRegex.test(input.email)) {
        errors.push("Invalid email format");
    }
  } else {
    errors.push("email is required")
  }

  if(input.full_name) {
    if (!input.full_name || input.full_name?.trim().length < 2) {
        errors.push("full_name must be at least 2 characters");
    }

    if (input.full_name?.length > 100) {
        errors.push("full_name too long");
    }
  } else {
    errors.push("full_name is required")
  }

  if(input.password) {
    if (input.password?.length < 8) {
        errors.push("Password must be at least 8 characters");
    }

    if (input.password?.length > 1000) {
        errors.push("Password too long");
    }
  } else {
    errors.push("password is required")
  }
  
  return errors;
}

export function validateLoginUserInput(input: {
  email?: string;
  password?: string;
}) {
  const errors: string[] = [];
  if(!input.email) {
    errors.push("email is required");
  }
  if(!input.password) {
    errors.push("password is required");
  }
  return errors;
}

export function validateUpdateUserInput(input: {
  full_name?: string;
  password?: string;
}) {
  const errors: string[] = [];

  if (!input.full_name && !input.password) {
      errors.push("At least one field (full_name or password) must be provided to update");
      return errors;
  }

  if (input.full_name !== undefined) {
      if (input.full_name.trim().length < 2) {
          errors.push("full_name must be at least 2 characters");
      }
      if (input.full_name.length > 100) {
          errors.push("full_name too long");
      }
  }

  if (input.password !== undefined) {
      if (input.password.length < 8) {
          errors.push("Password must be at least 8 characters");
      }
      if (input.password.length > 1000) {
          errors.push("Password too long");
      }
  }

  return errors;
}

export function validateCaptcha(captchaAnswer: any, captchaToken: string | undefined): string | null {
    if (captchaAnswer === undefined || !captchaToken) {
        return 'CAPTCHA solution and token are required';
    }

    try {
        const secret = process.env.JWT_SECRET || 'super_secret_fallback_key';
        
        const decoded = jwt.verify(captchaToken, secret) as JwtPayload;

        if (String(captchaAnswer).trim() !== String(decoded.answer)) {
            return 'Incorrect CAPTCHA answer. Try again.';
        }

        return null; 
    } catch (captchaErr) {
        return 'CAPTCHA session expired or invalid. Please refresh.';
    }
}