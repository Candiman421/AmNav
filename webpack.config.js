const path = require('path');
const ES3Plugin = require('webpack-es3-plugin');

module.exports = {
    entry: './ActionManager/ActionDescriptorNavigator.ts',

    mode: process.env.NODE_ENV || 'production',

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.build.json'
                    }
                },
                exclude: /node_modules/,
            },
        ],
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, '.'),
            '@tests': path.resolve(__dirname, 'tests')
        }
    },

    output: {
        filename: 'ActionDescriptorNavigator.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'ActionDescriptorNavigator',
        libraryTarget: 'var'  // ExtendScript compatible
    },

    // ES3 compatibility plugin (matches your work framework)
    plugins: [
        new ES3Plugin()
    ],

    // ExtendScript optimizations
    optimization: {
        minimize: false,  // Keep readable for ExtendScript debugging
    },

    // Development
    devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
};