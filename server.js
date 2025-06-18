import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import OpenAI from "openai";
import {
  createRepo,
  uploadFiles,
  whoAmI,
  spaceInfo,
  fileExists,
} from "@huggingface/hub";
import { InferenceClient } from "@huggingface/inference";
import bodyParser from "body-parser";

import checkUser from "./middlewares/checkUser.js";
import { MODELS } from "./utils/providers.js";
import { COLORS } from "./utils/colors.js";


// Load environment variables from .env file
dotenv.config();

const app = express();

const ipAddresses = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080;
const REDIRECT_URI =
  process.env.REDIRECT_URI || `http://localhost:${PORT}/auth/login`;
const MAX_REQUESTS_PER_IP = 2;

const SEARCH_START = "<<<<<<< SEARCH";
const DIVIDER = "=======";
const REPLACE_END = ">>>>>>> REPLACE";

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "dist")));

const getPTag = (repoId) => {
  return `<p style="border-radius: 8px; text-align: center; font-size: 12px; color: #fff; margin-top: 16px;position: fixed; left: 8px; bottom: 8px; z-index: 10; background: rgba(0, 0, 0, 0.8); padding: 4px 8px;">Made with <img src="https://enzostvs-deepsite.hf.space/logo.svg" alt="DeepSite Logo" style="width: 16px; height: 16px; vertical-align: middle;display:inline-block;margin-right:3px;filter:brightness(0) invert(1);"><a href="https://enzostvs-deepsite.hf.space" style="color: #fff;text-decoration: underline;" target="_blank" >DeepSite</a> - 🧬 <a href="https://enzostvs-deepsite.hf.space?remix=${repoId}" style="color: #fff;text-decoration: underline;" target="_blank" >Remix</a></p>`;
};

app.get("/api/login", (_req, res) => {
  const redirectUrl = `https://huggingface.co/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid%20profile%20write-repos%20manage-repos%20inference-api&prompt=consent&state=1234567890`;
  res.status(200).send({
    ok: true,
    redirectUrl,
  });
});
app.get("/auth/login", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(302, "/");
  }
  const Authorization = `Basic ${Buffer.from(
    `${process.env.OAUTH_CLIENT_ID}:${process.env.OAUTH_CLIENT_SECRET}`
  ).toString("base64")}`;

  const request_auth = await fetch("https://huggingface.co/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const response = await request_auth.json();

  if (!response.access_token) {
    return res.redirect(302, "/");
  }

  res.cookie("hf_token", response.access_token, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.redirect(302, "/");
});
app.get("/auth/logout", (req, res) => {
  res.clearCookie("hf_token", {
    httpOnly: false,
    secure: true,
    sameSite: "none",
  });
  return res.redirect(302, "/");
});

app.get("/api/@me", checkUser, async (req, res) => {
  let { hf_token } = req.cookies;

  if (process.env.HF_TOKEN && process.env.HF_TOKEN !== "") {
    return res.send({
      preferred_username: "local-use",
      isLocalUse: true,
    });
  }

  try {
    const request_user = await fetch("https://huggingface.co/oauth/userinfo", {
      headers: {
        Authorization: `Bearer ${hf_token}`,
      },
    });

    const user = await request_user.json();
    res.send(user);
  } catch (err) {
    res.clearCookie("hf_token", {
      httpOnly: false,
      secure: true,
      sameSite: "none",
    });
    res.status(401).send({
      ok: false,
      message: err.message,
    });
  }
});

app.post("/api/deploy", checkUser, async (req, res) => {
  const { html, title, path, prompts } = req.body;
  if (!html || (!path && !title)) {
    return res.status(400).send({
      ok: false,
      message: "Missing required fields",
    });
  }

  let { hf_token } = req.cookies;
  if (process.env.HF_TOKEN && process.env.HF_TOKEN !== "") {
    hf_token = process.env.HF_TOKEN;
  }

  try {
    const repo = {
      type: "space",
      name: path ?? "",
    };

    let readme;
    let newHtml = html;

    if (!path || path === "") {
      const { name: username } = await whoAmI({ accessToken: hf_token });
      const newTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .split("-")
        .filter(Boolean)
        .join("-")
        .slice(0, 96);

      const repoId = `${username}/${newTitle}`;
      repo.name = repoId;

      await createRepo({
        repo,
        accessToken: hf_token,
      });
      const colorFrom = COLORS[Math.floor(Math.random() * COLORS.length)];
      const colorTo = COLORS[Math.floor(Math.random() * COLORS.length)];
      readme = `---
title: ${newTitle}
emoji: 🐳
colorFrom: ${colorFrom}
colorTo: ${colorTo}
sdk: static
pinned: false
tags:
  - deepsite
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference`;
    }

    newHtml = html.replace(/<\/body>/, `${getPTag(repo.name)}</body>`);
    const file = new Blob([newHtml], { type: "text/html" });
    file.name = "index.html"; // Add name property to the Blob

    // create prompt.txt file with all the prompts used, split by new line
    const newPrompts = ``.concat(prompts.map((prompt) => prompt).join("\n"));
    const promptFile = new Blob([newPrompts], { type: "text/plain" });
    promptFile.name = "prompts.txt"; // Add name property to the Blob

    const files = [file, promptFile];
    if (readme) {
      const readmeFile = new Blob([readme], { type: "text/markdown" });
      readmeFile.name = "README.md"; // Add name property to the Blob
      files.push(readmeFile);
    }
    await uploadFiles({
      repo,
      files,
      commitTitle: `${prompts[prompts.length - 1]} - ${
        prompts.length > 1 ? "Follow Up" : "Initial"
      } Deployment`,
      accessToken: hf_token,
    });
    return res.status(200).send({ ok: true, path: repo.name });
  } catch (err) {
    return res.status(500).send({
      ok: false,
      message: err.message,
    });
  }
});

app.post("/api/ask-ai", async (req, res) => {

  const { prompt, model, apiKey,redesignMarkdown } = req.body;

  console.log("api-key为"+ apiKey,"model为"+model,req.body);
  if (!model) {
    return res.status(400).send({
      ok: false,
      message: "Missing required fields",
    });
  }
  if (!redesignMarkdown && !prompt) {
    return res.status(400).send({
      ok: false,
      message: "Missing required fields",
    });
  }

  const initialSystemPrompt = `ONLY USE HTML, CSS AND JAVASCRIPT. If you want to use ICON make sure to import the library first. Try to create the best UI possible by using only HTML, CSS and JAVASCRIPT. MAKE IT RESPONSIVE USING TAILWINDCSS. Use as much as you can TailwindCSS for the CSS, if you can't do something with TailwindCSS, then use custom CSS (make sure to import <script src="https://cdn.tailwindcss.com"></script> in the head). Also, try to ellaborate as much as you can, to create something unique. ALWAYS GIVE THE RESPONSE INTO A SINGLE HTML FILE`;
  let completeResponse = "";

  const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
        apiKey: apiKey,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);
    // Set up response headers for streaming
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const  completion = await openai.chat.completions.create(
      {
        model: model,
        messages: [
          {
            role: "system",
            content: initialSystemPrompt,
          },
          {
            role: "user",
            content: redesignMarkdown
              ? `Here is my current design as a markdown:\n\n${redesignMarkdown}\n\nNow, please create a new design based on this markdown.`
              : prompt,
          },
        ],
        stream: true,
        // max_tokens: selectedProvider.max_tokens,
      },
    );

    for await (const chunk of completion) {

      const content = chunk.choices[0]?.delta?.content || '';


      res.write(content);
      let completeResponse='';
      completeResponse += content;

      // Break when HTML is complete
      if (completeResponse.includes("</html>")) {
        break;
      }
  }
    // End the response stream
    res.end();
  } catch (error) {
    if (error.message.includes("exceeded your monthly included credits")) {
      return res.status(402).send({
        ok: false,
        openProModal: true,
        message: error.message,
      });
    }
    if (!res.headersSent) {
      res.status(500).send({
        ok: false,
        message:
          error.message || "An error occurred while processing your request.",
      });
    } else {
      // Otherwise end the stream
      res.end();
    }
  }
});

app.put("/api/ask-ai", async (req, res) => {
  console.log(req.body)
  const { prompt, apiKey, html,previousPrompt } = req.body;
  if (!prompt || !html) {
    return res.status(400).send({
      ok: false,
      message: "Missing required fields",
    });
  }
  const followUpSystemPrompt = `You are an expert web developer modifying an existing HTML file.
The user wants to apply changes based on their request.
You MUST output ONLY the changes required using the following SEARCH/REPLACE block format. Do NOT output the entire file.
Explain the changes briefly *before* the blocks if necessary, but the code changes THEMSELVES MUST be within the blocks.
Format Rules:
1. Start with ${SEARCH_START}
2. Provide the exact lines from the current code that need to be replaced.
3. Use ${DIVIDER} to separate the search block from the replacement.
4. Provide the new lines that should replace the original lines.
5. End with ${REPLACE_END}
6. You can use multiple SEARCH/REPLACE blocks if changes are needed in different parts of the file.
7. To insert code, use an empty SEARCH block (only ${SEARCH_START} and ${DIVIDER} on their lines) if inserting at the very beginning, otherwise provide the line *before* the insertion point in the SEARCH block and include that line plus the new lines in the REPLACE block.
8. To delete code, provide the lines to delete in the SEARCH block and leave the REPLACE block empty (only ${DIVIDER} and ${REPLACE_END} on their lines).
9. IMPORTANT: The SEARCH block must *exactly* match the current code, including indentation and whitespace.
Example Modifying Code:
\`\`\`
Some explanation...
${SEARCH_START}
    <h1>Old Title</h1>
${DIVIDER}
    <h1>New Title</h1>
${REPLACE_END}
${SEARCH_START}
  </body>
${DIVIDER}
    <script>console.log("Added script");</script>
  </body>
${REPLACE_END}
\`\`\`
Example Deleting Code:
\`\`\`
Removing the paragraph...
${SEARCH_START}
  <p>This paragraph will be deleted.</p>
${DIVIDER}
${REPLACE_END}
\`\`\``;

  // force to use deepseek-ai/DeepSeek-V3-0324 model, to avoid thinker models.
  const selectedModel = MODELS[0];
  const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
        apiKey: apiKey,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    });
  try {
    const  completion = await openai.chat.completions.create(
      {
        model: selectedModel.value,
        messages: [
          {
            role: "system",
            content: followUpSystemPrompt,
          },
          {
            role: "user",
            content: previousPrompt
              ? previousPrompt
              : "You are modifying the HTML file based on the user's request.",
          },
          {
            role: "assistant",
            content: `The current code is: \n\`\`\`html\n${html}\n\`\`\``,
          },
          {
            role: "user",
            content: prompt,
          },
        ]
      }
    );

    const chunk = completion.choices[0]?.message?.content;
    // TO DO: handle the case where there are multiple SEARCH/REPLACE blocks
    if (!chunk) {
      return res.status(400).send({
        ok: false,
        message: "No content returned from the model",
      });
    }

    if (chunk) {
      let newHtml = html;
      // array of arrays to hold updated lines (start and end line numbers)
      const updatedLines = [];

      // Find all search/replace blocks in the chunk
      let position = 0;
      let moreBlocks = true;

      while (moreBlocks) {
        const searchStartIndex = chunk.indexOf(SEARCH_START, position);
        if (searchStartIndex === -1) {
          moreBlocks = false;
          continue;
        }

        const dividerIndex = chunk.indexOf(DIVIDER, searchStartIndex);
        if (dividerIndex === -1) {
          moreBlocks = false;
          continue;
        }

        const replaceEndIndex = chunk.indexOf(REPLACE_END, dividerIndex);
        if (replaceEndIndex === -1) {
          moreBlocks = false;
          continue;
        }

        // Extract the search and replace blocks
        const searchBlock = chunk.substring(
          searchStartIndex + SEARCH_START.length,
          dividerIndex
        );
        const replaceBlock = chunk.substring(
          dividerIndex + DIVIDER.length,
          replaceEndIndex
        );

        // Apply the replacement
        if (searchBlock.trim() === "") {
          // Inserting at the beginning
          newHtml = `${replaceBlock}\n${newHtml}`;

          // Track first line as updated
          updatedLines.push([1, replaceBlock.split("\n").length]);
        } else {
          // Find the position of the search block in the HTML
          const blockPosition = newHtml.indexOf(searchBlock);
          if (blockPosition !== -1) {
            // Count lines before the search block
            const beforeText = newHtml.substring(0, blockPosition);
            const startLineNumber = beforeText.split("\n").length;

            // Count lines in search and replace blocks
            const replaceLines = replaceBlock.split("\n").length;

            // Calculate end line (start + length of replaced content)
            const endLineNumber = startLineNumber + replaceLines - 1;

            // Track the line numbers that were updated
            updatedLines.push([startLineNumber, endLineNumber]);

            // Perform the replacement
            newHtml = newHtml.replace(searchBlock, replaceBlock);
          }
        }

        // Move position to after this block to find the next one
        position = replaceEndIndex + REPLACE_END.length;
      }

      return res.status(200).send({
        ok: true,
        html: newHtml,
        updatedLines,
      });
    } else {
      return res.status(400).send({
        ok: false,
        message: "No content returned from the model",
      });
    }
  } catch (error) {
    if (error.message.includes("exceeded your monthly included credits")) {
      return res.status(402).send({
        ok: false,
        openProModal: true,
        message: error.message,
      });
    }
    if (!res.headersSent) {
      res.status(500).send({
        ok: false,
        message:
          error.message || "An error occurred while processing your request.",
      });
    }
  }
});

app.get("/api/remix/:username/:repo", async (req, res) => {
  const { username, repo } = req.params;
  const { hf_token } = req.cookies;

  let token = hf_token || process.env.DEFAULT_HF_TOKEN;

  if (process.env.HF_TOKEN && process.env.HF_TOKEN !== "") {
    token = process.env.HF_TOKEN;
  }

  const repoId = `${username}/${repo}`;

  const url = `https://huggingface.co/spaces/${repoId}/raw/main/index.html`;
  try {
    const space = await spaceInfo({
      name: repoId,
      accessToken: token,
      additionalFields: ["author"],
    });

    if (!space || space.sdk !== "static" || space.private) {
      return res.status(404).send({
        ok: false,
        message: "Space not found",
      });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(404).send({
        ok: false,
        message: "Space not found",
      });
    }
    let html = await response.text();
    // remove the last p tag including this url https://enzostvs-deepsite.hf.space
    html = html.replace(getPTag(repoId), "");

    let user = null;

    if (token) {
      const request_user = await fetch(
        "https://huggingface.co/oauth/userinfo",
        {
          headers: {
            Authorization: `Bearer ${hf_token}`,
          },
        }
      )
        .then((res) => res.json())
        .catch(() => null);

      user = request_user;
    }

    res.status(200).send({
      ok: true,
      html,
      isOwner: space.author === user?.preferred_username,
      path: repoId,
    });
  } catch (error) {
    return res.status(500).send({
      ok: false,
      message: error.message,
    });
  }
});

app.post("/api/re-design", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send({
      ok: false,
      message: "Missing required fields",
    });
  }

  // call the api https://r.jina.ai/{url} and return the response
  try {
    const response = await fetch(
      `https://r.jina.ai/${encodeURIComponent(url)}`,
      {
        method: "POST",
      }
    );
    if (!response.ok) {
      return res.status(500).send({
        ok: false,
        message: "Failed to fetch redesign",
      });
    }
    // return the html response
    const markdown = await response.text();
    return res.status(200).send({
      ok: true,
      markdown,
    });
  } catch (error) {
    return res.status(500).send({
      ok: false,
      message: error.message,
    });
  }
});
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
