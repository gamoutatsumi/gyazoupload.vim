import { assert, clippy, Denops, fn, is, readAll, vars } from "./deps.ts";
import argsParser from "https://deno.land/x/yargs_parser@yargs-parser-v20.2.9-deno/deno.ts";

const argsParseOption = {
  boolean: ["m"],
};

export function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async upload(...args): Promise<void> {
      const homePath = await fn.expand(denops, "~") as string;

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
      assert(token, is.String);

      const toInsert = (typeof parsedArgs.m === "boolean")
        ? parsedArgs.m
        : !!await vars.g.get(
          denops,
          "gyazo_insert_markdown_url",
          0,
        );

      if (parsedArgs._.length > 0) {
        filePath = parsedArgs._.join("").replace(/^~/, homePath);
      }

      const image = await readAll(
        (filePath == undefined)
          ? await clippy.read_image()
          : await Deno.open(filePath),
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
