import { hash, compare } from "bcryptjs";

const encrypt = async (pass: string) => {
  return await hash(pass, 8);
};

const verified = async (plainPassword: string, hashPassword: string) => {
  return await compare(plainPassword, hashPassword);
};

export { encrypt, verified };
