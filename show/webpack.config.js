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
    entry: entries,
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
        ],
    },
    plugins: [
    // Generate an HTML file for each entry using the day.html template
        ...Object.keys(entries).map(
            (name) =>
                new HtmlWebpackPlugin({
                    template: "./src/day.html", // Use the shared day.html template
                    filename: `${name}.html`, // Outputs day01.html, day02.html, etc.
                    chunks: [name], // Include only the corresponding entry chunk
                    templateParameters: {
                        dayName: name.toUpperCase(), // Pass the name to the template (e.g., "DAY01")
                    },
                })
        ),
        // Use the manually created index.html as-is
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "index.html",
            chunks: [], // No JS for the main index.html page
        }),
    ],
    devServer: {
        static: "./dist",
        open: true,
        port: 9000,
    },
};
