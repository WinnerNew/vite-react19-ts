import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import path from "path";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  console.log("Loaded env:", env);
  return {
    server: {
      port: Number(env.VITE_PORT) || 3000,
      open: true,
      host: true,
    },
    plugins: [
      viteCompression({
        algorithm: "gzip", // 使用 gzip 压缩
        ext: ".gz", // 生成的文件扩展名
        threshold: 10240, // 仅压缩大于 10KB 的文件
        deleteOriginFile: false, // 是否删除原始文件
        compressionOptions: { level: 9 }, // 压缩级别，1-9，越高压缩率越大
      }),
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
