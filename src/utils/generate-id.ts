import { monotonicFactory } from "ulid";

const ulid = monotonicFactory();

export const generateId = () => {
  return ulid();
};