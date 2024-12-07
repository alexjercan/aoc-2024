import path from "path";
import fs from "fs";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

const daysDir = path.resolve("src/days");
const entries = fs
    .readdirSync(daysDir)
    .filter((file) => file.endsWith(".ts"))
    .reduce((entryObj, file) => {
        const name = file.replace(".ts", "");
        entryObj[name] = path.resolve(daysDir, file);
        return entryObj;
    }, {});

export default {
    mode: "development",
    entry: {
        ...entries,
        day: "./src/day.ts",
        styles: "./src/styles.css",
    },
    output: {
        filename: "[name].js",
        path: path.resolve("dist"),
        library: {
            type: "var",
            name: "[name]",
        },
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                use: ["babel-loader"],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader", "postcss-loader"],
            },
        ],
    },
    plugins: [
        ...Object.keys(entries).map(
            (name) =>
                new HtmlWebpackPlugin({
                    template: "./src/day.html",
                    filename: `${name}.html`,
                    chunks: [name, "styles"],
                    templateParameters: {
                        dayName: name.charAt(0).toUpperCase() + name.slice(1),
                        dayIndex: Number(name.slice(3)).toString(),
                    },
                })
        ),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "index.html",
            chunks: ["styles"],
        }),
        new CopyWebpackPlugin({
            patterns: [{ from: "src/assets", to: "assets" }],
        }),
    ],
    devServer: {
        static: "./dist",
        open: true,
        port: 9000,
    },
};
