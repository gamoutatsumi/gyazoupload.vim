import { Denops } from "./vendor/https/deno.land/x/denops_std/mod.ts";
import { ensureString } from "./vendor/https/deno.land/x/unknownutil/mod.ts";
import * as vars from "./vendor/https/deno.land/x/denops_std/variable/mod.ts";
import * as clip from "./vendor/https/deno.land/x/clipboard_image/mod.ts";
import * as fn from "./vendor/https/deno.land/x/denops_std/function/mod.ts";
import { readAll } from "./vendor/https/deno.land/std/io/mod.ts";
import { getToken } from "./token.ts";

export function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async upload(filePath?: unknown): Promise<void> {
      let yankReg = "*";
      if (await fn.has(denops, "linux") || await fn.has(denops, "unix")) {
        yankReg = "+";
      }
      const token = await getToken();
      const toInsert = !!await vars.g.get(
        denops,
        "gyazo_insert_markdown_url",
        0,
      );
      if (filePath !== undefined) {
        ensureString(filePath);
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
        throw Error(json.message);
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
