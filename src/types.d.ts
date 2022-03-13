export {};

declare global {
  namespace Chat {
    interface ReturnType<T> {
      statusCode: HttpStatus;
      message: string;
      data: T;
    }
  }

  namespace Auth {
    interface User {
      id?: string;
      username: string;
      role: number;
      email: string;
      emailValid: boolean;
      state: string;
      avatar: string;
    }
  }

  namespace Email {
    interface Verify {
      email: string;
    }
  }

  namespace Friend {
    interface Request {
      uid: string;
      username: string;
    }
  }
}
