import dts from 'rollup-plugin-dts';

export default {
    input: './types/main.d.ts',
    output: {
        file: './dist/bundle.d.ts',
        format: 'es',
    },
    plugins: [dts()],
};
