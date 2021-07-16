import { Book } from "./Book";
import { Role } from "./Role";
import { User } from "./User";

export * from "./Book";
export * from "./User";

export type EntityMap = {
  User: User;
  Book: Book;
  Role: Role;
};
export type EntityName = keyof EntityMap;

export const entities = [User, Book];
export const EntityNames: { [E in EntityName]: E } = {
  User: "User",
  Book: "Book",
  Role: "Role"
};
export function isEntity(s: unknown): s is EntityName {
  return typeof s === "string" && s in EntityNames;
}
