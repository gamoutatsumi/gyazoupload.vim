import { Denops } from "./vendor/https/deno.land/x/denops_std/mod.ts";
import { ensureString } from "./vendor/https/deno.land/x/unknownutil/mod.ts";
import * as vars from "./vendor/https/deno.land/x/denops_std/variable/mod.ts";
import * as clip from "./vendor/https/deno.land/x/clipboard_image/mod.ts";
import * as fn from "./vendor/https/deno.land/x/denops_std/function/mod.ts";
import { readAll } from "./vendor/https/deno.land/std/io/mod.ts";
import argsParser from "./vendor/https/deno.land/x/yargs_parser/deno.ts";

const argsParseOption = {
  boolean: ["m"],
};

export function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async upload(...args): Promise<void> {
      let filePath;
      const parsedArgs = argsParser(args, argsParseOption);

      let yankReg = "*";
      if (await fn.has(denops, "linux") || await fn.has(denops, "unix")) {
        yankReg = "+";
      }

      const token = await vars.g.get(denops, "gyazo#token");
      if (token == null) {
        console.error(`Gyazo token is not defined`);
        return;
      }
      ensureString(token);

      const toInsert = (typeof parsedArgs.m === "boolean")
        ? parsedArgs.m
        : !!await vars.g.get(
          denops,
          "gyazo_insert_markdown_url",
          0,
        );

      if (parsedArgs._.length > 0) {
        filePath = parsedArgs._.join("");
      }

      const image = await readAll(
        (filePath == undefined) ? await clip.read() : await Deno.open(filePath),
      );
      const imageBlob = new Blob([image]);

      const formData = new FormData();
      formData.append("imagedata", imageBlob);
      formData.append("access_token", token);

      const req = new Request(`https://upload.gyazo.com/api/upload`, {
        method: "POST",
        body: formData,
      });

      const res = await fetch(req);
      const json = await res.json();
      if (json.url == null && json.error != null) {
        console.error(json.message);
        return;
      }

      if (toInsert) {
        fn.setline(denops, ".", `![](${json.url})`);
      } else {
        fn.setreg(denops, yankReg, json.url);
        console.log(`yanked ${json.url}`);
      }
    },
  };
  return Promise.resolve();
}