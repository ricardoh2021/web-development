import path from "path";
import { fileURLToPath } from "url";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: "development",
    entry: {
        main: "./src/styles/main.scss", // SCSS entry point
        utils: "./src/js/utils.js",    // JavaScript entry point
    },
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "js/[name].bundle.js", // Output JS files to a "js" folder
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
            {
                test: /\.js$/, // Rule for JavaScript files
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader", // Use Babel for transpiling (optional)
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/[name].css", // CSS files go to public/css/
        }),
    ],
    devtool: "source-map",
    watch: true,
};