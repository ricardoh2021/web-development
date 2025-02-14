import path from "path";
import { fileURLToPath } from "url";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: "development",
    entry: "./src/styles/main.scss",
    output: {
        path: path.resolve(__dirname, "public/css"),
        filename: "bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
        ],
    },
    plugins: [new MiniCssExtractPlugin({ filename: "main.css" })],
    devtool: "source-map",
    watch: true,
};