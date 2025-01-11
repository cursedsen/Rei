import { isBotMaster } from "../../config/botMasters.js";
import { sendMessage } from "../../functions/reiMessageMaker.js";
import { promisify } from "util";
import { exec } from "child_process";

export default {
  name: "update",
  description: "Update Rei",
  async execute(message) {
    if (!isBotMaster(message.author.id)) {
      return await sendMessage(message, {
        title: "Access Denied",
        description: "Only bot owners can pull the latest changes.",
        color: 0xff0000,
      });
    }

    try {
      const execAsync = promisify(exec);

      console.log("Attempting git pull...");
      const { stdout, stderr } = await execAsync("git pull", {
        cwd: process.cwd(),
        timeout: 10000,
      });

      console.log(
        "Git pull completed. stdout:",
        stdout,
        "stderr:",
        stderr
      );

      if (stderr && !stderr.includes("Already up to date")) {
        console.warn("Git pull warning:", stderr);
        await sendMessage(message, {
          title: "Warning",
          description: stderr,
          color: 0xffaa00,
        });
        return;
      }

      await sendMessage(message, {
        title: "Update Successful",
        description: stdout,
        color: 0x00ff00,
      });
    } catch (error) {
      console.error("Git pull error:", error);
      await sendMessage(message, {
        title: "Update Failed",
        description: error.message,
        color: 0xff0000,
      }).catch((err) =>
        console.error("Failed to send error message:", err)
      );
    }
  },
};
