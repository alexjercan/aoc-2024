import path from "path";
import fs from "fs";
import HtmlWebpackPlugin from "html-webpack-plugin";

// Get all TypeScript files in the /src/days directory
const daysDir = path.resolve("src/days");
const entries = fs
    .readdirSync(daysDir)
    .filter((file) => file.endsWith(".ts"))
    .reduce((entryObj, file) => {
        const name = file.replace(".ts", ""); // e.g., 'day01' from 'day01.ts'
        entryObj[name] = path.resolve(daysDir, file);
        return entryObj;
    }, {});

export default {
    mode: "development",
    entry: {
        ...entries,
        styles: "./src/styles.css",
    },
    output: {
        filename: "[name].js", // Outputs day01.js, day02.js, etc.
        path: path.resolve("dist"),
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
                test: /\.css$/,
                use: ["style-loader", "css-loader", "postcss-loader"],
            },
        ],
    },
    plugins: [
        // Generate an HTML file for each entry using the day.html template
        ...Object.keys(entries).map(
            (name) =>
                new HtmlWebpackPlugin({
                    template: "./src/day.html", // Use the shared day.html template
                    filename: `${name}.html`, // Outputs day01.html, day02.html, etc.
                    chunks: [name, "styles"], // Include only the corresponding entry chunk
                    templateParameters: {
                        // Capitalize the day name for the title
                        dayName: name.charAt(0).toUpperCase() + name.slice(1),
                        dayIndex: Number(name.slice(3)).toString(),
                    },
                })
        ),
        // Use the manually created index.html as-is
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "index.html",
            chunks: ["styles"], // No JS for the main index.html page
        }),
    ],
    devServer: {
        static: "./dist",
        open: true,
        port: 9000,
    },
};
