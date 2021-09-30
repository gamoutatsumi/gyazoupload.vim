import * as path from "./vendor/https/deno.land/std/path/mod.ts";

export async function getToken(): Promise<string> {
  let token = Deno.env.get("GYAZO_TOKEN");
  if (token != null) {
    return token;
  }
  const dir = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE");
  if (dir == null) {
    throw Error(`User home directory is not defined.`);
  }
  const configFile = path.join(dir, ".gyazo_token");
  const config = await Deno.readTextFile(configFile);
  if (config === "") {
    throw Error(`${configFile} is empty.`);
  }
  token = config.trim();
  if (token === "") {
    throw Error(`gyazo token is empty`);
  }

  return token;
}
