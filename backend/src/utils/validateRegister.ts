import { UsernamePasswordInput } from "../resolvers/UsernamePasswordInput";

export const validateRegister = (userData: UsernamePasswordInput) => {
  if (!userData.email
      .toLowerCase()
      .match( /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
  ) {
    return [
      {
        field: "email",
        message: "Invalid email",
      },
    ];
  }

  if (userData.username.length <= 2) {
    return [
      {
        field: "username",
        message: "Length must be greater than 2",
      },
    ];
  }

  if (userData.username.includes("@")) {
    return [
      {
        field: "username",
        message: "Cannot include an @",
      },
    ];
  }

  if (userData.password.length <= 2) {
    return [
      {
        field: "password",
        message: "Length must be greater than 2",
      },
    ];
  }

  return null;
};